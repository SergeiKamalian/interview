export const FINAL_EVALUATION_PROMPT_KEY = 'final_evaluation';
export const FINAL_EVALUATION_PROMPT_VERSION = '2.0.0';

export const GUARDRAIL_RULES = [
  'Use only facts from provided question evaluations and topic breakdown.',
  'Do not invent new skills, topics, checkpoints, or candidate statements.',
  'Strengths and weaknesses must map to supplied evaluation data.',
  'Final score is precomputed as weighted average: sum(topicScore * topicWeight) / sum(topicWeight).',
  'Topic weights reflect interview importance — do not change or reinterpret them.',
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

export type FinalEvaluationTopicContext = {
  topic: string;
  score: number;
  weight: number;
  weightedScore: number;
  strengthCategory: string;
};

export function buildFinalEvaluationUserPrompt(input: {
  finalScore: number;
  totalWeight: number;
  averageScore: number;
  strengthCategory: string;
  category: string;
  hireRecommendation: string;
  questionSummaries: string[];
  topicEvaluations: FinalEvaluationTopicContext[];
  categoryBreakdown: string[];
  evidenceSource?: 'adaptive_summaries' | 'question_evaluations';
}): string {
  return [
    'Summarize this interview using only the structured data below.',
    input.evidenceSource === 'adaptive_summaries'
      ? 'Evidence source: adaptive checkpoint summaries (no full transcript).'
      : 'Evidence source: per-question evaluations.',
    '',
    `Weighted final score (0-10): ${input.finalScore}`,
    `Total topic weight: ${input.totalWeight}`,
    `Unweighted average topic score (0-10): ${input.averageScore}`,
    `Strength category: ${input.strengthCategory}`,
    `Legacy category: ${input.category}`,
    `Recommendation: ${input.hireRecommendation}`,
    '',
    'Topic evaluations (score 0-10, weight = interview importance):',
    ...input.topicEvaluations.map(
      (topic) =>
        `- ${topic.topic}: score=${topic.score}, weight=${topic.weight}, weightedScore=${topic.weightedScore}, category=${topic.strengthCategory}`,
    ),
    '',
    'Question evaluations:',
    ...input.questionSummaries.map((line) => `- ${line}`),
    '',
    'Category breakdown:',
    ...input.categoryBreakdown.map((line) => `- ${line}`),
  ].join('\n');
}
