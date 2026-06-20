import type { FinalEvaluationEntity } from '../../ai-evaluation/entities/final-evaluation.entity';

export type CandidateComparisonPromptAttempt = {
  attemptId: string;
  candidateName: string;
  candidateEmail: string;
  evaluation: FinalEvaluationEntity;
};

const RESPONSE_JSON_SCHEMA = `{
  "recommendedAttemptId": "attempt id to prioritize, or null if no clear winner",
  "recommendationTitle": "short Russian title",
  "recommendationSummary": "2-4 Russian sentences explaining the final advice",
  "decisionRationale": ["concrete reason 1", "concrete reason 2"],
  "ranking": [
    {
      "attemptId": "attempt id",
      "rank": 1,
      "headline": "one-line Russian summary of this candidate's position in the pool",
      "tradeOff": "what you give up if you pick this candidate over higher-ranked options"
    }
  ],
  "useCases": [
    {
      "title": "case name",
      "recommendedAttemptId": "attempt id or null",
      "rationale": "why this candidate fits this case"
    }
  ],
  "candidateNotes": [
    {
      "attemptId": "attempt id",
      "bestFor": "where this candidate is stronger",
      "strengths": ["strength 1", "strength 2"],
      "risks": ["risk 1", "risk 2"],
      "followUpQuestions": ["question to ask live", "question to ask live"]
    }
  ],
  "caveats": ["what hiring team should not over-trust"]
}`;

export function buildCandidateComparisonSystemPrompt(
  candidateCount: number,
): string {
  const poolContext =
    candidateCount === 2
      ? 'двух кандидатов'
      : `пула из ${candidateCount} кандидатов (финальный shortlist перед оффером)`;

  return [
    `Ты помогаешь hiring team сравнить ${poolContext} после AI-интервью.`,
    'Пиши строго на русском языке.',
    'Используй термин "ИИ", не "AI", во всех пользовательских текстах.',
    'Не придумывай факты вне входных данных.',
    'Не заменяй живое интервью: явно отмечай, что нужно проверить дальше.',
    'Давай практический совет: кого приоритизировать первым, trade-offs между кандидатами, для какого кейса кто лучше, где риски.',
    candidateCount > 2
      ? 'ranking должен содержать всех кандидатов с уникальными rank от 1 (лучший) до N; объясни trade-offs между соседними позициями.'
      : 'ranking должен содержать две записи с rank 1 и 2.',
    'Если победитель неочевиден, recommendedAttemptId должен быть null и объясни почему.',
    'Return valid JSON only, no markdown fences.',
    'Required JSON shape:',
    RESPONSE_JSON_SCHEMA,
  ].join('\n');
}

export function buildCandidateComparisonUserPrompt(params: {
  interview: {
    title: string;
    jobRole: string;
    level: string;
    professionName?: string | null;
    skills: string[];
  };
  attempts: CandidateComparisonPromptAttempt[];
}): string {
  const candidateCount = params.attempts.length;
  const task =
    candidateCount === 2
      ? 'Compare these two candidates and advise hiring team who to prioritize and for which cases each candidate fits better.'
      : `Rank and compare these ${candidateCount} candidates as a final hiring pool: who to invite first, key trade-offs (A vs B vs C), and which candidate fits which scenario.`;

  return JSON.stringify(
    {
      interview: params.interview,
      candidates: params.attempts.map((attempt) => ({
        attemptId: attempt.attemptId,
        candidateName: attempt.candidateName,
        candidateEmail: attempt.candidateEmail,
        totalScore: attempt.evaluation.totalScore,
        hireRecommendation: attempt.evaluation.hireRecommendation,
        achievedLevel:
          attempt.evaluation.achievedLevel === null
            ? null
            : String(attempt.evaluation.achievedLevel),
        achievedLevelMethod:
          attempt.evaluation.achievedLevelMethod === null
            ? null
            : String(attempt.evaluation.achievedLevelMethod),
        category: attempt.evaluation.category,
        summary: attempt.evaluation.summary,
        detailedSummary: attempt.evaluation.detailedSummary,
        strengths: attempt.evaluation.strengths,
        weaknesses: attempt.evaluation.weaknesses,
        risks: attempt.evaluation.risks,
        needsManualReview: attempt.evaluation.needsManualReview,
      })),
      task,
    },
    null,
    2,
  );
}
