#!/usr/bin/env node
import { setTimeout as sleep } from 'node:timers/promises';

const GRAPHQL = process.env.GRAPHQL_URL ?? 'http://localhost:3000/graphql';
const PUBLIC_TOKEN =
  process.env.PUBLIC_TOKEN ?? 'ee511aed-3123-4726-97e0-c13b6895c952';
const AUTH_EMAIL = process.env.REPLAY_AUTH_EMAIL ?? 'test14@example.com';
const AUTH_PASSWORD = process.env.REPLAY_AUTH_PASSWORD ?? 'password123';

const PROFILES = {
  bad: {
    label: 'bad',
    answers: [
      'Fiber — это Virtual DOM, React быстрее обновляет страницу через diffing.',
      'Render phase и commit phase одно и то же — React сразу пишет в DOM. requestIdleCallback планирует работу. Concurrent mode полностью убирает лаги на 20000 элементов.',
      'Узлы parent и next лежат в Virtual DOM. Redux хранит fiber.',
      'Commit можно прервать как render. Fiber разбивает commit на куски по 5ms.',
      'Lanes в Redux. requestIdleCallback решает приоритеты. flushSync везде для скорости.',
      'Scheduler не знаю, давайте дальше.',
    ],
  },
  casual: {
    label: 'casual-strong',
    answers: [
      'Ага, на 18-й работали. createRoot, startTransition. Fiber — ну типа новый движок, дерево узлов, render можно приостановить, commit в DOM.',
      'Короче раньше всё через стек — мог подвиснуть. Узлы child-sibling-return. setState кидает update с lane. render в памяти, dom не трогают. scheduler yield через message channel.',
      'Ну у узла child, sibling, return. current и alternate для wip.',
      'Старый reconciler синхронно через call stack. Fiber кусками, yield с того же узла.',
      'wip — черновик, diff alternate, dom старый, потом commit.',
      'Scheduler work loop, yield ~5ms, message channel, не idle callback.',
      'Lanes — sync lane для ввода, startTransition для тяжёлого.',
      'Render прерывается, commit нет. Большой dom может лагать на commit.',
      'Commit — wip готов, синхронно dom insert/update, refs, effects.',
    ],
  },
  strong: {
    label: 'formal-strong',
    answers: [
      'Да, на практике с React 18: createRoot, startTransition, useDeferredValue. Fiber — reconciliation engine: связное дерево fiber-узлов, render прерывается через lanes и shouldYield, commit атомарно применяет DOM.',
      'При setState React создаёт update с lane. Render строит WIP: child/sibling/return, current/alternate. Scheduler через MessageChannel и shouldYield (~5ms) не блокирует main thread. Commit атомарно: mutation, layout, passive effects.',
      'Раньше call stack — синхронный обход. Fiber — инкрементальный work loop с паузами.',
      'Fiber-узел: child, sibling, return; current и alternate для double buffering.',
      'Render phase строит WIP в памяти, DOM не меняется. Commit синхронно применяет мутации.',
      'Scheduler, shouldYield, MessageChannel — не requestIdleCallback.',
      'SyncLane vs TransitionLane, startTransition, useDeferredValue, createRoot.',
      'Concurrent не делает commit прерываемым; массовый commit всё равно может лагать.',
    ],
  },
};

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

async function runProfile(profileKey) {
  const profile = PROFILES[profileKey];
  const stamp = Date.now();
  const email = `replay-${profile.label}-${stamp}@example.com`;

  const start = await gql(
    `mutation($input: StartPublicInterviewInput!) {
      startPublicInterview(input: $input) { attemptId }
    }`,
    {
      input: {
        publicToken: PUBLIC_TOKEN,
        fullName: `Replay ${profile.label}`,
        email,
      },
    },
  );

  const attemptId = start.startPublicInterview.attemptId;
  await gql(
    `mutation($input: BeginInterviewAttemptInput!) {
      beginInterviewAttempt(input: $input) { attemptId }
    }`,
    { input: { publicToken: PUBLIC_TOKEN, attemptId } },
  );

  for (const answer of profile.answers) {
    const submit = await gql(
      `mutation($input: SubmitInterviewAnswerInput!) {
        submitInterviewAnswer(input: $input) {
          status
          isFollowUp
        }
      }`,
      {
        input: { publicToken: PUBLIC_TOKEN, attemptId, answer },
      },
    );
    if (submit.submitInterviewAnswer.status === 'completed') {
      break;
    }
    await sleep(1200);
  }

  const token = (
    await gql(
      `mutation($input: LoginInput!) { login(input: $input) { accessToken } }`,
      { input: { email: AUTH_EMAIL, password: AUTH_PASSWORD } },
    )
  ).login.accessToken;

  const review = await gql(
    `query($id: ID!) {
      adaptiveCheckpointReviewByAttempt(attemptId: $id) {
        redFlags { checkpointKey }
        questionGroups { checkpoints { checkpointKey scoreAwarded depthLabel } }
      }
      finalEvaluationByAttempt(attemptId: $id) {
        totalScore hireRecommendation
      }
    }`,
    { id: attemptId },
    token,
  );

  const cps = review.adaptiveCheckpointReviewByAttempt.questionGroups[0].checkpoints;
  const total = cps.reduce((sum, cp) => sum + cp.scoreAwarded, 0);
  const fe = review.finalEvaluationByAttempt;

  return {
    profile: profile.label,
    attemptId,
    score100: Math.round((total / 8) * 100),
    score10: fe?.totalScore ?? Math.round((total / 8) * 10 * 10) / 10,
    recommendation: fe?.hireRecommendation ?? 'n/a',
    redFlags: review.adaptiveCheckpointReviewByAttempt.redFlags.length,
  };
}

async function main() {
  const results = [];
  for (const key of ['bad', 'casual', 'strong']) {
    console.log(`\n=== Running ${key} profile ===`);
    results.push(await runProfile(key));
  }
  console.log('\n=== SUMMARY ===');
  console.table(results);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
