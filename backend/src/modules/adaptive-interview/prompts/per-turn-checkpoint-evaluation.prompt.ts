import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';

export const PER_TURN_CHECKPOINT_EVALUATION_PROMPT_KEY =
  'per_turn_checkpoint_evaluation';
export const PER_TURN_CHECKPOINT_EVALUATION_PROMPT_VERSION = '2.4.0';

const RESPONSE_JSON_SCHEMA = `{
  "candidate_disposition": "engaged | declined | confused | off_topic",
  "checkpoint_results": [
    {
      "checkpoint_key": "string — must match one of the provided checkpoint keys exactly",
      "status": "covered | partial | missed | unclear",
      "score_awarded": 0,
      "confidence": 0.0,
      "evidence_summary": "short evidence summary or null",
      "rationale": "short explanation in 1-2 sentences"
    }
  ]
}`;

export function buildPerTurnCheckpointEvaluationSystemPrompt(): string {
  return [
    'You are a strict technical interview evaluator for a live adaptive interview.',
    'Assess the latest candidate answer together with earlier local turns for the current question.',
    'Evidence is cumulative across the conversation — scores must reflect everything the candidate already said in local turns.',
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
    'Status + score rubric (MANDATORY):',
    '- covered: the checkpoint is substantially correct with NO material false claims → score_awarded = max_score.',
    '- partial: correct core idea BUT incomplete, imprecise, OR mixed with wrong details for this checkpoint → score_awarded ≈ 40–60% of max_score (for max_score=1 use 0.5).',
    '- missed: fundamentally wrong, only keywords, or confident false explanation → score_awarded = 0.',
    '- unclear: candidate did not address this checkpoint at all → score_awarded = 0.',
    '',
    'Half-right / half-wrong answers:',
    '- If an answer is ~50% correct and ~50% false for a checkpoint, status MUST be partial (NOT covered) and score MUST be below max_score.',
    '- Example: names Fiber + reconciliation correctly but says requestIdleCallback drives scheduling → scheduling = partial 0.5, not covered 1.',
    '- Example: explains child/sibling/return but adds wrong parent/next or «stored in Virtual DOM» → fiber_pointers = partial 0.5.',
    '- NEVER set status=covered with score=max when your rationale mentions incorrect, contradictory, or imprecise parts.',
    '',
    '- If a candidate mentions the term but explains it incorrectly, mark missed or partial — not covered.',
    '- Award partial credit when the answer is meaningfully true but incomplete or imprecise.',
    '- Confident false statements MUST cap the checkpoint at partial or missed; do not treat false explanations as full knowledge.',
    '- Do NOT give all zeros when earlier local turns already demonstrated partial knowledge.',
    '- If the latest answer declines only one sub-aspect, keep scores from earlier turns; use declined only for whole-question refusal.',
    '- Also set candidate_disposition from the latest answer:',
    '  - engaged: candidate tries to answer substantively, even if incorrect;',
    '  - declined: candidate refuses or clearly says they do not know / cannot answer;',
    '  - confused: candidate explicitly says they do not understand the question or topic (not just a wrong answer);',
    '  - off_topic: unrelated nonsense, jokes, random objects, spam, insults — answer does not engage with the question at all.',
    '- Examples: "А вот я в моей тарелке" → off_topic; "рендер и API" about useEffect → engaged + partial;',
    '  "не понимаю что такое useEffect" → confused; "не знаю" → declined.',
    '- off_topic and engaged wrong answers are NOT confused.',
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

  return [
    'Evaluate the latest candidate answer for the current question only.',
    '',
    'Question:',
    context.questionText,
    '',
    'Reference answer (short, not a strict match requirement):',
    context.referenceAnswer,
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
    'Preserve prior earned score only when checkpoint states already show it.',
    'Do not add new score for a checkpoint unless the local turns contain semantically correct evidence for that checkpoint.',
  ].join('\n');
}
