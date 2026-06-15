import type { InterviewQuestionSummaryEntity } from '../../adaptive-interview/entities/interview-question-summary.entity';

export type FinalEvidenceContext = {
  source: 'adaptive_summaries' | 'question_evaluations';
  totalScoreOutOfTen: number;
  category: string;
  hireRecommendation: string;
  questionSummaries: string[];
  categoryBreakdown: string[];
  includesFullTranscript: boolean;
};

export function buildFinalEvidenceContext(input: {
  summaries: InterviewQuestionSummaryEntity[];
  totalScoreOutOfTen: number;
  category: string;
  hireRecommendation: string;
  categoryBreakdown: string[];
}): FinalEvidenceContext {
  return {
    source: 'adaptive_summaries',
    totalScoreOutOfTen: input.totalScoreOutOfTen,
    category: input.category,
    hireRecommendation: input.hireRecommendation,
    questionSummaries: input.summaries.map(
      (summary) =>
        `Q${summary.interviewQuestionId}: score ${summary.score}/${summary.maxScore}; ${summary.summary}`,
    ),
    categoryBreakdown: input.categoryBreakdown,
    includesFullTranscript: false,
  };
}
