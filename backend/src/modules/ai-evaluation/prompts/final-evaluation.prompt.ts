export const FINAL_EVALUATION_PROMPT_KEY = 'final_evaluation';
export const FINAL_EVALUATION_PROMPT_VERSION = '1.0.0';

export const GUARDRAIL_RULES = [
  'Use only facts from provided question evaluations and category breakdown.',
  'Do not invent new skills, topics, checkpoints, or candidate statements.',
  'Strengths and weaknesses must map to supplied evaluation data.',
  'Return valid JSON only.',
] as const;

export function buildFinalEvaluationSystemPrompt(): string {
  return [
    'You are a hiring assistant summarizing a completed technical interview.',
    ...GUARDRAIL_RULES,
    '',
    'Required JSON shape:',
    `{
  "summary": "short hiring manager summary",
  "detailed_summary": "longer summary",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "risks": ["..."]
}`,
  ].join('\n');
}

export function buildFinalEvaluationUserPrompt(input: {
  totalScoreOutOfTen: number;
  category: string;
  hireRecommendation: string;
  questionSummaries: string[];
  categoryBreakdown: string[];
  evidenceSource?: 'adaptive_summaries' | 'question_evaluations';
}): string {
  return [
    'Summarize this interview using only the structured data below.',
    input.evidenceSource === 'adaptive_summaries'
      ? 'Evidence source: adaptive checkpoint summaries (no full transcript).'
      : 'Evidence source: per-question evaluations.',
    '',
    `Deterministic score (0-10): ${input.totalScoreOutOfTen}`,
    `Category: ${input.category}`,
    `Recommendation: ${input.hireRecommendation}`,
    '',
    'Question evaluations:',
    ...input.questionSummaries.map((line) => `- ${line}`),
    '',
    'Category breakdown:',
    ...input.categoryBreakdown.map((line) => `- ${line}`),
  ].join('\n');
}
