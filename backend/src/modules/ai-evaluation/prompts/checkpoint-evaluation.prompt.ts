import type {
  CheckpointDefinition,
  CheckpointEvaluationContext,
  TranscriptFragment,
} from '../types/checkpoint-evaluation.types';

export const CHECKPOINT_EVALUATION_PROMPT_KEY = 'checkpoint_evaluation';
export const CHECKPOINT_EVALUATION_PROMPT_VERSION = '1.0.0';

const RESPONSE_JSON_SCHEMA = `{
  "checkpoints": [
    {
      "checkpoint_key": "string — must match one of the provided checkpoint keys exactly",
      "status": "met | partially_met | not_met",
      "confidence": 0.0,
      "evidence_quote": "verbatim quote from candidate answer or empty string",
      "reasoning_short": "short explanation in 1-2 sentences"
    }
  ]
}`;

export function buildCheckpointEvaluationSystemPrompt(): string {
  return [
    'You are a strict technical interview evaluator for a hiring platform.',
    'Your job is to assess whether the candidate answer satisfies predefined checkpoints from the question bank.',
    '',
    'Rules:',
    '- Use ONLY the checkpoints provided in the user message. Do NOT invent new criteria.',
    '- Do NOT change checkpoint keys, titles, expected criteria, or max scores.',
    '- Base evidence ONLY on the candidate answer and transcript fragments provided.',
    '- If there is no supporting evidence for a checkpoint, set status to "not_met" and evidence_quote to "".',
    '- Return valid JSON only, with no markdown fences or extra commentary.',
    '',
    'Required JSON shape:',
    RESPONSE_JSON_SCHEMA,
  ].join('\n');
}

export function buildCheckpointEvaluationUserPrompt(
  context: Omit<
    CheckpointEvaluationContext,
    'interviewId' | 'attemptId' | 'companyId' | 'sourceQuestionId'
  >,
): string {
  const checkpointBlock = formatCheckpoints(context.checkpoints);
  const transcriptBlock = formatTranscript(context.transcriptFragments);

  return [
    'Evaluate the candidate answer against the checkpoints below.',
    '',
    'Question:',
    context.questionText,
    '',
    'Expected ideal answer (reference only, not a strict match requirement):',
    context.idealAnswer,
    '',
    'Checkpoints (source of truth from question bank):',
    checkpointBlock,
    '',
    'Candidate answer:',
    context.candidateAnswer,
    '',
    'Transcript fragments for this question:',
    transcriptBlock,
    '',
    `Return one result object per checkpoint (${context.checkpoints.length} total).`,
    'Use checkpoint_key values exactly as listed above.',
    'If evidence is missing, status must be "not_met" with an empty evidence_quote.',
  ].join('\n');
}

function formatCheckpoints(checkpoints: CheckpointDefinition[]): string {
  return checkpoints
    .map((checkpoint, index) =>
      [
        `${index + 1}. key=${checkpoint.checkpointKey}`,
        `   title=${checkpoint.title}`,
        `   expected=${checkpoint.expected}`,
        `   max_score=${checkpoint.score}`,
      ].join('\n'),
    )
    .join('\n\n');
}

function formatTranscript(fragments: TranscriptFragment[]): string {
  if (fragments.length === 0) {
    return '(none)';
  }

  return fragments
    .map((fragment) => `[${fragment.role}] ${fragment.content}`)
    .join('\n');
}
