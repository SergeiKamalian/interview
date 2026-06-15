import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';

export const PER_TURN_CHECKPOINT_EVALUATION_PROMPT_KEY =
  'per_turn_checkpoint_evaluation';
export const PER_TURN_CHECKPOINT_EVALUATION_PROMPT_VERSION = '2.2.0';

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
    '- Award partial credit when the answer mentions relevant concepts even if wrong or incomplete.',
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
    .map(
      (checkpoint, index) =>
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
    'If local turns contain substantive on-topic content, award partial credit to matching checkpoints.',
  ].join('\n');
}
