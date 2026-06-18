#!/usr/bin/env node
/**
 * QA: replay attempt-82 Fiber answers (first 3 turns) and verify follow-ups before lazy switch.
 * Usage: node backend/scripts/replay-attempt82-fiber-qa.mjs
 */
import { setTimeout as sleep } from 'node:timers/promises';
import { execSync } from 'node:child_process';

const GRAPHQL = process.env.GRAPHQL_URL ?? 'http://localhost:3000/graphql';
const PUBLIC_TOKEN =
  process.env.PUBLIC_TOKEN ?? 'aaeaed94-8f12-48ae-aa06-cb3febebb74a';
const AI_WAIT_MS = Number(process.env.QA_AI_WAIT_MS ?? 35000);

const FIBER_ANSWERS = [
  'Ну давайте попробуем',
  'React Fiber — это внутренняя система React, которая помогает обновлять интерфейс по частям, а не всё сразу. Когда меняется state или props, React сначала считает, что изменилось, сравнивает старое дерево с новым. Это render phase. Потом применяет в DOM — commit phase. Fiber делает обновления плавнее с приоритетами.',
  'Scheduler — это планировщик React. Он решает, когда продолжать render, а когда уступить поток. MessageChannel / postMessage — это механизм таймеров, через который React говорит: «продолжим работу позже, чтобы интерфейс оставался отзывчивым». Scheduler расставляет приоритеты, а MessageChannel продолжает работу частями.',
];

async function gql(query, variables = {}) {
  const res = await fetch(GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(JSON.stringify(json.errors, null, 2));
  }
  return json.data;
}

function queryMessages(attemptId) {
  const sql = `SELECT sequence_order, role, message_kind, target_checkpoint_key, LEFT(content, 80) AS preview FROM interview_messages WHERE interview_attempt_id=${attemptId} ORDER BY sequence_order;`;
  const out = execSync(
    `docker exec ai-interviewer-local-mysql-1 mysql -uai_interviewer -pchangeme ai_interviewer -N -e "${sql}" 2>/dev/null`,
    { encoding: 'utf8' },
  );
  return out.trim().split('\n').filter(Boolean);
}

async function main() {
  const stamp = Date.now();
  const email = `attempt82-qa-${stamp}@example.com`;

  const start = await gql(
    `mutation($input: StartPublicInterviewInput!) {
      startPublicInterview(input: $input) { attemptId totalQuestions }
    }`,
    {
      input: {
        publicToken: PUBLIC_TOKEN,
        fullName: `Attempt82 QA ${stamp}`,
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

  for (let i = 0; i < FIBER_ANSWERS.length; i++) {
    console.log(`\n--- Fiber answer ${i + 1}/${FIBER_ANSWERS.length} ---`);
    const submit = await gql(
      `mutation($input: SubmitInterviewAnswerInput!) {
        submitInterviewAnswer(input: $input) {
          answeredMainQuestions isFollowUp messageKind status
          nextQuestionText
        }
      }`,
      {
        input: {
          publicToken: PUBLIC_TOKEN,
          attemptId,
          answer: FIBER_ANSWERS[i],
        },
      },
    );
    console.log('submit:', {
      ...submit.submitInterviewAnswer,
      nextPreview: submit.submitInterviewAnswer.nextQuestionText?.slice(0, 120),
    });

    if (i < FIBER_ANSWERS.length - 1) {
      await sleep(AI_WAIT_MS);
    } else {
      await sleep(AI_WAIT_MS);
    }
  }

  const rows = queryMessages(attemptId);
  console.log('\n=== MESSAGE FLOW ===');
  for (const row of rows) {
    console.log(row);
  }

  const fiberFollowUps = rows.filter((row) =>
    row.includes('follow_up_question') && !row.includes('when_to_use'),
  );
  const nextAfterScheduling = rows.find((row) => row.startsWith('8\t'));

  const hasStackProbe = rows.some(
    (row) => row.includes('follow_up_question') && row.includes('stack_vs_fiber'),
  );
  const switchedToLazyEarly = rows.some(
    (row) => row.includes('topic_opener') && row.startsWith('8\t'),
  );

  console.log('\n=== QA CHECKS (14.24 + 14.26) ===');
  console.log('Fiber follow-ups before lazy:', fiberFollowUps.length);
  console.log('stack_vs_fiber probe scheduled:', hasStackProbe);
  console.log('Early lazy topic switch (seq 8):', switchedToLazyEarly);
  console.log('Message seq 8:', nextAfterScheduling ?? '(missing)');

  if (switchedToLazyEarly) {
    console.error('\nFAIL: switched to lazy at seq 8 (attempt 82 regression)');
    process.exit(1);
  }
  if (!hasStackProbe) {
    console.error('\nFAIL: no stack_vs_fiber follow-up after scheduling');
    process.exit(1);
  }
  if (fiberFollowUps.length < 2) {
    console.warn('\nWARN: fewer than 2 fiber follow-ups — may need more answers to validate 14.26 budget');
  }

  console.log('\nPASS: Fiber probing continues before lazy topic switch');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
