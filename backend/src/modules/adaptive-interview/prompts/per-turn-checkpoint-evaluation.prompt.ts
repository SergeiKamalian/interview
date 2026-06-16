import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';

export const PER_TURN_CHECKPOINT_EVALUATION_PROMPT_KEY =
  'per_turn_checkpoint_evaluation';
export const PER_TURN_CHECKPOINT_EVALUATION_PROMPT_VERSION = '2.5.3';

export function getPerTurnCheckpointEvaluationPromptVersion(): string {
  const override = process.env.PER_TURN_EVAL_PROMPT_VERSION?.trim();
  return override || PER_TURN_CHECKPOINT_EVALUATION_PROMPT_VERSION;
}

const RESPONSE_JSON_SCHEMA = `{
  "candidate_disposition": "engaged | declined | confused | off_topic",
  "checkpoint_results": [
    {
      "checkpoint_key": "string — must match one of the provided checkpoint keys exactly",
      "coverage": "none | low | medium | high",
      "accuracy": "none | wrong | partial | full",
      "depth": "mention_only | heard_of | partial_knowledge | understands | knows | false_claim",
      "status": "covered | partial | missed | unclear",
      "score_awarded": 0,
      "confidence": 0.0,
      "evidence_summary": "short evidence summary or null",
      "rationale": "short explanation in 1-2 sentences; MUST include depth=... and coverage=/accuracy= labels"
    }
  ]
}`;

export function buildPerTurnCheckpointEvaluationSystemPrompt(): string {
  return [
    'You are a strict technical interview evaluator for a live adaptive interview.',
    'Assess the latest candidate answer together with earlier local turns for the current question.',
    'For EACH checkpoint, the LATEST answer has highest weight: a confident false claim in the latest answer must reduce that checkpoint even if an earlier turn was correct.',
    'Evidence is cumulative for context, but scoring must reflect contradictions and explicit refusals in the latest answer.',
    '',
    'Rules:',
    '- Use ONLY the checkpoints provided in the user message.',
    '- Do NOT invent new criteria or checkpoint keys.',
    '- Do NOT change max scores; score_awarded must be between 0 and the checkpoint max_score.',
    '- status must be one of: covered, partial, missed, unclear.',
    '- Base evidence only on the provided candidate answer and local turns.',
    '- Evaluate semantic correctness, not keyword presence.',
    '- Do NOT award credit just because the candidate mentions a relevant term.',
    '',
    'Per-checkpoint mental checklist (MANDATORY before scoring each checkpoint):',
    '1. MENTION: Did the candidate name this topic? (yes/no)',
    '2. EXPLAIN: Did they explain HOW/WHY correctly? (yes/no/partial)',
    '3. FALSE: Any confident false claim about this topic? (yes/no)',
    '4. DEPTH: mention_only | heard_of | partial_knowledge | understands | knows | false_claim',
    '',
    'Coverage vs accuracy (MANDATORY in JSON + rationale):',
    '- coverage: none | low | medium | high — did they touch the topic?',
    '- accuracy: none | wrong | partial | full — was the explanation correct?',
    '- depth in rationale as depth=<level> (e.g. depth=partial_knowledge)',
    '- mention_only / heard_of without correct explanation → missed or partial ≤ 25% of max_score',
    '- partial correct explanation → partial 40–60% of max_score',
    '- correct without material false claims → covered',
    '- false claims → partial or missed, never covered; depth=false_claim',
    '',
    'Depth taxonomy:',
    '- depth=mention_only — buzzwords only, no explanation',
    '- depth=heard_of — «слышал, не помню»',
    '- depth=partial_knowledge — correct idea with notable gaps only',
    '- depth=understands — coherent multi-sentence explanation with correct core mechanics',
    '- depth=knows — precise details and terminology',
    '- depth=false_claim — confident wrong statement',
    '',
    'Depth calibration (IMPORTANT):',
    '- If the candidate gives a coherent explanation with correct core mechanics, prefer depth=understands (NOT partial_knowledge).',
    '- Missing optional details alone (e.g. ~5ms chunks, explicit requestIdleCallback denial, createRoot vs render) must NOT force partial_knowledge when the core is correct.',
    '- Use depth=partial_knowledge only when the explanation is fragmentary or misses the main mechanism.',
    '- coverage=high when the candidate names 3+ correct aspects for that checkpoint.',
    '- accuracy=full when the explained core is correct and there are NO material false claims for that checkpoint.',
    '',
    'Status + score rubric (MANDATORY):',
    '- covered: accuracy=full, NO material false claims → score_awarded = max_score.',
    '- partial: correct core idea BUT incomplete, imprecise, OR mixed with wrong details → score_awarded ≈ 40–60% of max_score.',
    '- missed: fundamentally wrong, only keywords, or confident false explanation → score_awarded = 0.',
    '- unclear: candidate did not address this checkpoint at all → score_awarded = 0.',
    '',
    'Half-right / half-wrong answers:',
    '- If an answer is ~50% correct and ~50% false for a checkpoint, status MUST be partial (NOT covered) and score MUST be below max_score.',
    '- Example: names Fiber + reconciliation correctly but says requestIdleCallback drives scheduling → scheduling = partial 0.5, depth=false_claim, not covered 1.',
    '- NEVER set status=covered with score=max when your rationale mentions incorrect, contradictory, or imprecise parts.',
    '',
    '- Confident false statements MUST cap the checkpoint at partial or missed; do not treat false explanations as full knowledge.',
    '- If the latest answer explicitly refuses a sub-topic («не знаю», «давайте дальше», «не скажу»), that checkpoint → missed with depth=heard_of even if mentioned earlier.',
    '- Use exactly ONE depth= label in rationale; never combine depth=knows and depth=false_claim.',
    '- Do NOT give all zeros when earlier local turns already demonstrated partial knowledge unless the latest answer contradicts or refuses that checkpoint.',
    '- If the latest answer declines only one sub-aspect, keep scores from earlier turns.',
    '- On follow-up answers, score the targeted checkpoint primarily from the latest answer; do not zero unrelated checkpoints unless the latest answer contradicts them.',
  '- Also set candidate_disposition from the latest answer:',
    '  - engaged: candidate tries to answer substantively, even if incorrect;',
    '  - declined: candidate refuses or clearly says they do not know / cannot answer;',
    '  - confused: candidate explicitly says they do not understand the question or topic;',
    '  - off_topic: unrelated nonsense — answer does not engage with the question.',
    '- Return valid JSON only, with no markdown fences or extra commentary.',
    '',
    'Required JSON shape:',
    RESPONSE_JSON_SCHEMA,
  ].join('\n');
}

export function buildPerTurnCheckpointEvaluationUserPrompt(
  context: AdaptiveInterviewContextPacket,
): string {
  const checkpointBlock = context.checkpoints
    .map((checkpoint, index) =>
      [
        `${index + 1}. key=${checkpoint.checkpointKey}`,
        `   title=${checkpoint.title}`,
        `   expected=${checkpoint.expected}`,
        `   max_score=${checkpoint.score}`,
      ].join('\n'),
    )
    .join('\n\n');

  const stateBlock =
    context.checkpointStates.length === 0
      ? '(none)'
      : context.checkpointStates
          .map(
            (state) =>
              `- ${state.checkpointKey}: status=${state.status}, score=${state.scoreAwarded}/${state.maxScore}`,
          )
          .join('\n');

  const evidenceBlock =
    context.evidenceSnippets.length === 0
      ? '(none)'
      : context.evidenceSnippets
          .map((item) => `- ${item.checkpointKey}: ${item.summary}`)
          .join('\n');

  const turnsBlock =
    context.localTurns.length === 0
      ? '(none)'
      : context.localTurns
          .map((turn) => `[${turn.role}] ${turn.content}`)
          .join('\n');

  const badExamplesBlock =
    (context.badAnswerExamples ?? []).length === 0
      ? '(none)'
      : (context.badAnswerExamples ?? [])
          .map((example, index) => `${index + 1}. ${example}`)
          .join('\n');

  const targetBlock =
    context.latestAnswerMessageKind === 'follow_up_answer' &&
    context.targetCheckpointKey
      ? [
          'Follow-up target checkpoint:',
          context.targetCheckpointKey,
          'The latest answer is a follow-up for this checkpoint. Prioritize evidence for it in the latest answer.',
          'For other checkpoints: keep current scores unless the latest answer adds new correct evidence or contradicts them.',
          '',
        ].join('\n')
      : '';

  return [
    'Evaluate the latest candidate answer for the current question only.',
    '',
    targetBlock,
    'Question:',
    context.questionText,
    '',
    'Reference answer (short, not a strict match requirement):',
    context.referenceAnswer,
    '',
    'Bad answer examples (do NOT award covered if candidate repeats these patterns):',
    badExamplesBlock,
    '',
    'Checkpoints (source of truth from interview snapshot):',
    checkpointBlock,
    '',
    'Current checkpoint states:',
    stateBlock,
    '',
    'Existing evidence snippets:',
    evidenceBlock,
    '',
    'Latest candidate answer:',
    context.latestCandidateAnswer || '(empty)',
    '',
    'Local turns for this question only:',
    turnsBlock,
    '',
    `Return exactly ${context.checkpoints.length} checkpoint_results entries.`,
    'Use checkpoint_key values exactly as listed above.',
    'For each checkpoint: score_awarded must be >= current score from checkpoint states (never decrease).',
    'Each rationale MUST include depth=..., coverage=..., accuracy=... labels.',
    'Do not add new score for a checkpoint unless the local turns contain semantically correct evidence for that checkpoint.',
  ].join('\n');
}
