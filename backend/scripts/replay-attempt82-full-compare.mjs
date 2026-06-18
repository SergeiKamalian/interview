#!/usr/bin/env node
/**
 * Full replay of attempt-82 candidate answers + comparison with original.
 * Usage: node backend/scripts/replay-attempt82-full-compare.mjs
 */
import { setTimeout as sleep } from 'node:timers/promises';
import { execSync } from 'node:child_process';

const GRAPHQL = process.env.GRAPHQL_URL ?? 'http://localhost:3000/graphql';
const PUBLIC_TOKEN =
  process.env.PUBLIC_TOKEN ?? 'aaeaed94-8f12-48ae-aa06-cb3febebb74a';
const BASELINE_ATTEMPT_ID = process.env.BASELINE_ATTEMPT_ID ?? '82';
const AUTH_EMAIL = process.env.REPLAY_AUTH_EMAIL ?? 'test14@example.com';
const AUTH_PASSWORD = process.env.REPLAY_AUTH_PASSWORD ?? 'password123';
const AI_WAIT_MS = Number(process.env.QA_AI_WAIT_MS ?? 35000);

const ANSWERS = [
  'Ну давайте попробуем',
  'React Fiber — это внутренняя система React, которая помогает обновлять интерфейс по частям, а не всё сразу.  Когда меняется state или props, React сначала считает, что изменилось, сравнивает старое дерево с новым. Это называется render phase.  Потом, когда React уже понял изменения, он применяет их в настоящий DOM. Это commit phase.  То есть Fiber помогает React делать обновления плавнее и с приоритетами, чтобы интерфейс не тормозил.',
  'Scheduler — это планировщик React. Он решает, какие обновления важнее: например, ввод пользователя важнее, чем перерисовка большого списка.  React не делает всю работу сразу, а режет её на куски.  MessageChannel / postMessage — это механизм браузера, через который React говорит: “продолжи работу чуть позже, когда основной поток освободится”.  То есть коротко: Scheduler расставляет приоритеты, а MessageChannel помогает выполнять работу частями, чтобы UI не зависал.',
  'Да, использовал.  React.lazy нужен, чтобы грузить компонент не сразу, а только когда он реально понадобится.  А Suspense показывает временный UI, например loader, пока этот компонент загружается.  То есть простыми словами: lazy откладывает загрузку компонента, а Suspense показывает fallback, пока он не загрузился.',
  'Я бы описал так:  React.lazy возвращает не сам компонент сразу, а специальный lazy-компонент, который внутри ждёт import().  Когда React пытается его отрендерить, а файл ещё грузится, он как бы “останавливается” на этом месте.  Suspense это ловит и показывает fallback, например loader.  Когда import() завершился, React уже получает настоящий компонент и вместо fallback рендерит его.  То есть коротко: lazy грузит компонент по Promise, Suspense пока ждёт — показывает loader, потом заменяет его на компонент.',
  'lazy больше всего даёт выигрыш на route-level — когда большая страница грузится только при переходе на неё.  Ещё норм кейс — тяжёлые модалки, графики, редакторы, карты, которые открываются не сразу.  Не стоит применять lazy для маленьких компонентов типа кнопки, инпута, простого блока — там выгоды почти нет, а усложнение и loader могут только мешать.  Коротко: lazy нужен для больших и не сразу нужных частей, а не для всего подряд.',
  'lazy объявляют снаружи компонента, чтобы он создавался один раз.  Если делать React.lazy внутри компонента, то на каждый рендер будет создаваться новый lazy-компонент.  Из-за этого React может думать, что это уже другой компонент: состояние может сбрасываться, Suspense может снова показывать loader, и могут быть лишние загрузки/рендеры.  Коротко: lazy должен быть стабильным, поэтому его выносят на уровень модуля.',
  'Если lazy-компонент не смог загрузить chunk, Suspense уже не поможет — он только для ожидания.  Ошибка пробрасывается выше, и её ловит ErrorBoundary.  Тогда вместо падения всего приложения можно показать нормальный fallback: например “не удалось загрузить страницу, обновите”.  Коротко: Suspense ловит загрузку, ErrorBoundary ловит ошибку загрузки.',
  'Я обычно ставлю ErrorBoundary снаружи Suspense.  Типа так по смыслу:  ErrorBoundary оборачивает Suspense, а внутри уже lazy-компонент.  Suspense отвечает за состояние “грузится” и показывает loader.  А если chunk не загрузился, ошибка поднимается выше, и её ловит ErrorBoundary, показывая уже fallback ошибки.  Коротко: ErrorBoundary снаружи, Suspense внутри. Suspense — для loading, ErrorBoundary — для failed loading.',
];

async function gql(query, variables = {}, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(GRAPHQL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(JSON.stringify(json.errors, null, 2));
  }
  return json.data;
}

function mysqlQuery(sql) {
  return execSync(
    `docker exec ai-interviewer-local-mysql-1 mysql -uai_interviewer -pchangeme ai_interviewer --default-character-set=utf8mb4 -N -e "${sql.replace(/"/g, '\\"')}" 2>/dev/null`,
    { encoding: 'utf8' },
  ).trim();
}

function loadMessageFlow(attemptId) {
  const rows = mysqlQuery(
    `SELECT sequence_order, role, message_kind, IFNULL(target_checkpoint_key,''), LEFT(content,60) FROM interview_messages WHERE interview_attempt_id=${attemptId} ORDER BY sequence_order`,
  );
  return rows ? rows.split('\n').filter(Boolean) : [];
}

function getQuestionIds(attemptId) {
  const rows = mysqlQuery(
    `SELECT DISTINCT interview_question_id FROM interview_messages WHERE interview_attempt_id=${attemptId} AND message_kind IN ('main_question','topic_opener') ORDER BY interview_question_id`,
  );
  const ids = rows ? rows.split('\n').map((r) => r.trim()).filter(Boolean) : [];
  return { fiber: Number(ids[0]), lazy: Number(ids[1]) };
}

function countFollowUpsForQuestion(attemptId, questionId) {
  if (!questionId) return 0;
  const n = mysqlQuery(
    `SELECT COUNT(*) FROM interview_messages WHERE interview_attempt_id=${attemptId} AND interview_question_id=${questionId} AND message_kind='follow_up_question'`,
  );
  return Number(n);
}

async function fetchReview(attemptId, token) {
  const data = await gql(
    `query($attemptId: ID!) {
      adaptiveCheckpointReviewByAttempt(attemptId: $attemptId) {
        questionGroups {
          questionText
          checkpoints {
            checkpointKey status scoreAwarded maxScore
            coveragePercent accuracyPercent depthLabel rationale
          }
        }
      }
      finalEvaluationByAttempt(attemptId: $attemptId) {
        totalScore hireRecommendation
      }
    }`,
    { attemptId: String(attemptId) },
    token,
  );
  return data;
}

function summarizeReview(review, label) {
  console.log(`\n========== ${label} (attempt ${review.attemptId ?? '?'}) ==========`);
  console.log('Final:', review.finalEvaluationByAttempt);

  for (const group of review.adaptiveCheckpointReviewByAttempt?.questionGroups ?? []) {
    const cps = group.checkpoints ?? [];
    const earned = cps.reduce((s, c) => s + c.scoreAwarded, 0);
    const max = cps.reduce((s, c) => s + c.maxScore, 0);
    console.log(`\n${group.questionText?.slice(0, 55)}...`);
    console.log(`  Score: ${earned.toFixed(2)}/${max} (${max > 0 ? Math.round((earned / max) * 100) : 0}%)`);
    for (const cp of cps) {
      console.log(
        `  ${cp.checkpointKey.padEnd(22)} ${cp.status.padEnd(8)} ${cp.scoreAwarded}/${cp.maxScore} cov=${cp.coveragePercent}%`,
      );
    }
  }
}

function loadCheckpointFollowUps(attemptId) {
  const rows = mysqlQuery(
    `SELECT interview_question_id, checkpoint_key, follow_up_count FROM interview_checkpoint_states WHERE interview_attempt_id=${attemptId} ORDER BY interview_question_id, checkpoint_key`,
  );
  const map = new Map();
  if (!rows) return map;
  for (const row of rows.split('\n')) {
    const [iq, key, fu] = row.split('\t');
    map.set(`${iq}:${key}`, Number(fu));
  }
  return map;
}

function compareCheckpoints(baseline, replay, questionIndex, baselineFu, replayFu, baselineIq, replayIq) {
  const bGroup = baseline.adaptiveCheckpointReviewByAttempt.questionGroups[questionIndex];
  const rGroup = replay.adaptiveCheckpointReviewByAttempt.questionGroups[questionIndex];
  if (!bGroup || !rGroup) return;

  console.log(`\n--- Delta: ${bGroup.questionText?.slice(0, 40)}... ---`);
  for (const bcp of bGroup.checkpoints) {
    const rcp = rGroup.checkpoints.find((c) => c.checkpointKey === bcp.checkpointKey);
    if (!rcp) continue;
    const scoreDelta = rcp.scoreAwarded - bcp.scoreAwarded;
    const bFu = baselineFu.get(`${baselineIq}:${bcp.checkpointKey}`) ?? 0;
    const rFu = replayFu.get(`${replayIq}:${bcp.checkpointKey}`) ?? 0;
    const fuDelta = rFu - bFu;
    if (
      Math.abs(scoreDelta) > 0.01 ||
      fuDelta !== 0 ||
      bcp.status !== rcp.status
    ) {
      console.log(
        `  ${bcp.checkpointKey}: ${bcp.status}/${bcp.scoreAwarded} → ${rcp.status}/${rcp.scoreAwarded} (Δscore ${scoreDelta >= 0 ? '+' : ''}${scoreDelta.toFixed(2)}, Δfu ${fuDelta >= 0 ? '+' : ''}${fuDelta})`,
      );
    }
  }
}

async function main() {
  const login = await gql(
    `mutation($input: LoginInput!) { login(input: $input) { accessToken } }`,
    { input: { email: AUTH_EMAIL, password: AUTH_PASSWORD } },
  );
  const token = login.login.accessToken;

  console.log('Loading baseline attempt', BASELINE_ATTEMPT_ID);
  const baseline = await fetchReview(BASELINE_ATTEMPT_ID, token);
  baseline.attemptId = BASELINE_ATTEMPT_ID;
  summarizeReview(baseline, 'BASELINE (attempt 82)');

  const baselineFlow = loadMessageFlow(BASELINE_ATTEMPT_ID);
  console.log('\n=== BASELINE message flow ===');
  for (const row of baselineFlow) console.log(row);

  const stamp = Date.now();
  const email = `attempt82-full-${stamp}@example.com`;
  console.log('\n\nStarting full replay for', email);

  const start = await gql(
    `mutation($input: StartPublicInterviewInput!) {
      startPublicInterview(input: $input) { attemptId totalQuestions }
    }`,
    {
      input: {
        publicToken: PUBLIC_TOKEN,
        fullName: `Attempt82 Full ${stamp}`,
        email,
      },
    },
  );

  const attemptId = start.startPublicInterview.attemptId;
  console.log('New attemptId:', attemptId);

  await gql(
    `mutation($input: BeginInterviewAttemptInput!) {
      beginInterviewAttempt(input: $input) { attemptId status }
    }`,
    { input: { publicToken: PUBLIC_TOKEN, attemptId } },
  );

  for (let i = 0; i < ANSWERS.length; i++) {
    console.log(`\n--- Answer ${i + 1}/${ANSWERS.length} ---`);
    const submit = await gql(
      `mutation($input: SubmitInterviewAnswerInput!) {
        submitInterviewAnswer(input: $input) {
          answeredMainQuestions isFollowUp messageKind status
        }
      }`,
      {
        input: {
          publicToken: PUBLIC_TOKEN,
          attemptId,
          answer: ANSWERS[i],
        },
      },
    );
    console.log('submit:', submit.submitInterviewAnswer);
    if (submit.submitInterviewAnswer.status === 'completed') {
      console.log('Interview completed early at answer', i + 1);
      break;
    }
    await sleep(AI_WAIT_MS);
  }

  await gql(
    `mutation($publicToken: String!, $attemptId: ID!) {
      completeInterviewAttempt(publicToken: $publicToken, attemptId: $attemptId) {
        attemptId status
      }
    }`,
    { publicToken: PUBLIC_TOKEN, attemptId },
  );

  console.log('\nWaiting for final evaluation...');
  await sleep(8000);

  const replay = await fetchReview(attemptId, token);
  replay.attemptId = attemptId;
  summarizeReview(replay, 'REPLAY (post-14 fixes)');

  const replayFlow = loadMessageFlow(attemptId);
  console.log('\n=== REPLAY message flow ===');
  for (const row of replayFlow) console.log(row);

  const bQ = getQuestionIds(BASELINE_ATTEMPT_ID);
  const rQ = getQuestionIds(attemptId);
  const bFiberFu = countFollowUpsForQuestion(BASELINE_ATTEMPT_ID, bQ.fiber);
  const rFiberFu = countFollowUpsForQuestion(attemptId, rQ.fiber);
  const bLazyFu = countFollowUpsForQuestion(BASELINE_ATTEMPT_ID, bQ.lazy);
  const rLazyFu = countFollowUpsForQuestion(attemptId, rQ.lazy);

  console.log('\n=== FLOW COMPARISON ===');
  console.log(`Fiber follow-ups:  baseline=${bFiberFu}  replay=${rFiberFu}`);
  console.log(`Lazy follow-ups:   baseline=${bLazyFu}  replay=${rLazyFu}`);

  const seq8Baseline = baselineFlow.find((r) => r.startsWith('8\t'));
  const seq8Replay = replayFlow.find((r) => r.startsWith('8\t'));
  console.log(`Seq 8 baseline: ${seq8Baseline ?? '(none)'}`);
  console.log(`Seq 8 replay:   ${seq8Replay ?? '(none)'}`);

  const baselineFu = loadCheckpointFollowUps(BASELINE_ATTEMPT_ID);
  const replayFu = loadCheckpointFollowUps(attemptId);
  const baselineIqs = mysqlQuery(
    `SELECT DISTINCT interview_question_id FROM interview_checkpoint_states WHERE interview_attempt_id=${BASELINE_ATTEMPT_ID} ORDER BY interview_question_id`,
  )
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);
  const replayIqs = mysqlQuery(
    `SELECT DISTINCT interview_question_id FROM interview_checkpoint_states WHERE interview_attempt_id=${attemptId} ORDER BY interview_question_id`,
  )
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);

  compareCheckpoints(baseline, replay, 0, baselineFu, replayFu, baselineIqs[0], replayIqs[0]);
  compareCheckpoints(baseline, replay, 1, baselineFu, replayFu, baselineIqs[1], replayIqs[1]);

  console.log('\n=== DASHBOARD ===');
  console.log(`Baseline: /dashboard/interviews/12?attemptId=${BASELINE_ATTEMPT_ID}`);
  console.log(`Replay:   /dashboard/interviews/12?attemptId=${attemptId}`);

  const improved =
    rFiberFu > bFiberFu ||
    replayFlow.some((r) => r.includes('stack_vs_fiber') || r.includes('fiber_pointers'));

  if (rFiberFu <= bFiberFu && !improved) {
    console.warn('\nWARN: Fiber follow-up count did not increase vs baseline');
  } else {
    console.log('\nOK: Fiber probing improved vs attempt 82 baseline');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
