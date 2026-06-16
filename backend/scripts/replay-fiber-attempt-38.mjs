#!/usr/bin/env node
/**
 * Replay attempt-42 Fiber interview answers for regression check.
 * Usage: node backend/scripts/replay-fiber-attempt-38.mjs
 */
import { setTimeout as sleep } from 'node:timers/promises';

const GRAPHQL = process.env.GRAPHQL_URL ?? 'http://localhost:3000/graphql';
const PUBLIC_TOKEN =
  process.env.PUBLIC_TOKEN ?? 'ee511aed-3123-4726-97e0-c13b6895c952';
const AUTH_EMAIL = process.env.REPLAY_AUTH_EMAIL ?? 'test14@example.com';
const AUTH_PASSWORD = process.env.REPLAY_AUTH_PASSWORD ?? 'password123';

const ANSWERS = [
  'Да, слышал про Fiber — знаю, что это про новый reconciler в React, но на практике глубоко не копал, детали не помню.',
  'Fiber разбивает обновление на маленькие шаги, чтобы не блокировать main thread. Сначала идёт render phase: React обходит fiber-дерево, считает что изменилось, строит список эффектов — это можно прерывать. Потом commit phase: уже синхронно применяет изменения к DOM, вызывает lifecycle и эффекты. То есть сначала планирование и diff, потом реальная запись в DOM.',
  'Главное ограничение — concurrent не делает commit прерываемым. Render можно разбить и уступать main thread, но когда начался commit, React синхронно пишет в DOM, гоняет layout effects и paint — на этом этапе большое обновление всё равно может подлагивать. Плюс concurrent нормально завязан на createRoot; старый ReactDOM.render так не работает. Детали про масштаб DOM или точные пороги «когда лагает» не помню.',
  'Раньше reconciler шёл рекурсивно через call stack — синхронный обход дерева, большое дерево могло надолго блокировать main thread. Fiber заменил это на связный список fiber-узлов: работа идёт порциями, между шагами React может уступить поток. То есть stack — синхронный обход «как вложенные вызовы», Fiber — инкрементальный обход с паузами.',
  'Fiber-узел — объект с type, key, state, props; связи: child (первый потомок), sibling (сосед), return (родитель). Дерево — связный список, не только call stack.',
  'Fiber планирует работу через scheduler и lanes (приоритеты обновлений). Render phase разбита на куски: в work loop React берёт fiber, делает шаг render, и между шагами проверяет, не пора ли уступить main thread — через shouldYield и тайм-слайсы (~5 ms). Для этого используется не requestIdleCallback, а обычно MessageChannel (или setImmediate в Node): так scheduler ставит следующий кусок работы, не блокируя ввод и paint. Разные обновления — разные lanes (sync, default, transition и т.д.): срочное (клик, ввод) обрабатывается раньше, transition-обновления (startTransition) могут ждать. Когда render phase готов, начинается commit — он синхронный и не прерывается.',
  'Fiber — это архитектура reconciler в React: обновление UI идёт через связный список fiber-узлов, а не синхронный рекурсивный обход call stack. React может инкрементально обходить дерево, прерывать render и планировать работу по приоритетам, а готовый результат синхронно применять в commit.',
  'В render phase React обходит fiber-дерево и строит work-in-progress tree — черновую версию. Пока идёт render, в DOM ещё старая картина: current tree остаётся на экране, а alternate/WIP собирается в памяти. React сравнивает props/state, помечает что менять, собирает список эффектов. Когда render phase закончен, готовый WIP передаётся в commit phase — там уже синхронно пишем в DOM.',
  'Честно, с lanes и приоритетами не разбирался — startTransition и useDeferredValue только названия слышал, как именно они мапятся на lanes, не скажу. Давайте дальше, эту часть лучше не трогать.',
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

function toScoreOutOfTen(rawEarned, rawMax) {
  if (rawMax <= 0) return 0;
  return Math.round((rawEarned / rawMax) * 100) / 10;
}

async function main() {
  const stamp = Date.now();
  const email = `fiber-replay-${stamp}@example.com`;

  console.log('Starting interview for', email);
  const start = await gql(
    `mutation($input: StartPublicInterviewInput!) {
      startPublicInterview(input: $input) {
        attemptId
        totalQuestions
      }
    }`,
    {
      input: {
        publicToken: PUBLIC_TOKEN,
        fullName: `Fiber Replay ${stamp}`,
        email,
      },
    },
  );

  const attemptId = start.startPublicInterview.attemptId;
  console.log('attemptId:', attemptId);

  await gql(
    `mutation($input: BeginInterviewAttemptInput!) {
      beginInterviewAttempt(input: $input) { attemptId status }
    }`,
    { input: { publicToken: PUBLIC_TOKEN, attemptId } },
  );

  for (let i = 0; i < ANSWERS.length; i++) {
    console.log(`\n--- Submit answer ${i + 1}/${ANSWERS.length} ---`);
    const submit = await gql(
      `mutation($input: SubmitInterviewAnswerInput!) {
        submitInterviewAnswer(input: $input) {
          answeredMainQuestions
          isFollowUp
          messageKind
          nextQuestionText
          status
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
    if (
      i < ANSWERS.length - 1 &&
      submit.submitInterviewAnswer.status === 'completed'
    ) {
      console.warn('Interview completed early after answer', i + 1);
      break;
    }
    await sleep(25000);
  }

  await gql(
    `mutation($publicToken: String!, $attemptId: ID!) {
      completeInterviewAttempt(publicToken: $publicToken, attemptId: $attemptId) {
        attemptId status
      }
    }`,
    { publicToken: PUBLIC_TOKEN, attemptId },
  );

  console.log('\nCompleted attempt', attemptId);
  await sleep(5000);

  const login = await gql(
    `mutation { login(input: { email: "${AUTH_EMAIL}", password: "${AUTH_PASSWORD}" }) { accessToken } }`,
  );
  const token = login.login.accessToken;

  const review = await gql(
    `query($attemptId: ID!) {
      adaptiveCheckpointReviewByAttempt(attemptId: $attemptId) {
        attemptId
        redFlags { checkpointKey summary candidateQuote }
        questionGroups {
          checkpoints {
            checkpointKey status scoreAwarded maxScore depthLabel coveragePercent accuracyPercent rationale
          }
        }
      }
      finalEvaluationByAttempt(attemptId: $attemptId) {
        totalScore hireRecommendation
      }
    }`,
    { attemptId },
    token,
  );

  const checkpoints =
    review.adaptiveCheckpointReviewByAttempt.questionGroups[0]?.checkpoints ?? [];
  const rawEarned = checkpoints.reduce((s, c) => s + c.scoreAwarded, 0);
  const rawMax = checkpoints.reduce((s, c) => s + c.maxScore, 0);
  const outOfTen = toScoreOutOfTen(rawEarned, rawMax);
  console.log('\n=== RESULT attempt', attemptId, '===');
  console.log('checkpoint score:', outOfTen, '/ 10 (', Math.round(outOfTen * 10), '/ 100)');
  console.log('final:', review.finalEvaluationByAttempt);
  console.log('red flags:', review.adaptiveCheckpointReviewByAttempt.redFlags.length);
  for (const cp of checkpoints) {
    console.log(
      `  ${cp.checkpointKey}: ${cp.scoreAwarded}/${cp.maxScore} ${cp.depthLabel} cov=${cp.coveragePercent}% acc=${cp.accuracyPercent}%`,
    );
  }
  console.log(JSON.stringify(review, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
