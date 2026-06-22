import type { AnswerExampleEntity } from '../entities/answer-example.entity';
import type { OverrideAnswerExampleEntity } from '../entities/company-question-override.entity';
import type { QuestionWithDetailsEntity } from '../entities/question.entity';
import type { CheckpointEvaluationHints } from '../../adaptive-interview/types/checkpoint-evaluation-hints.type';

export type CompanyQuestionOverrideMergeData = {
  extraMustConcepts: string[] | null;
  extraFalseClaims: string[] | null;
  extraAnswerExamples: OverrideAnswerExampleEntity[] | null;
  topicWeightOverride: number | null;
};

export type MergeQuestionWithOverrideResult = {
  question: QuestionWithDetailsEntity;
  topicWeightOverride?: number;
};

export function dedupeStrings(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const trimmed = item.trim();
    if (trimmed.length === 0 || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    result.push(trimmed);
  }

  return result;
}

export function mergeEvaluationHints(
  globalHints: CheckpointEvaluationHints | null,
  override: CompanyQuestionOverrideMergeData,
): CheckpointEvaluationHints | null {
  const mustConcepts = dedupeStrings([
    ...(globalHints?.mustConcepts ?? []),
    ...(override.extraMustConcepts ?? []),
  ]);
  const falseClaims = dedupeStrings([
    ...(globalHints?.falseClaims ?? []),
    ...(override.extraFalseClaims ?? []),
  ]);

  if (
    mustConcepts.length === 0 &&
    falseClaims.length === 0 &&
    !globalHints
  ) {
    return null;
  }

  return {
    ...globalHints,
    mustConcepts: mustConcepts.length > 0 ? mustConcepts : undefined,
    falseClaims: falseClaims.length > 0 ? falseClaims : undefined,
  };
}

export function mergeAnswerExamples(
  globalExamples: AnswerExampleEntity[],
  extraExamples: OverrideAnswerExampleEntity[] | null,
): AnswerExampleEntity[] {
  if (!extraExamples || extraExamples.length === 0) {
    return globalExamples;
  }

  const appended: AnswerExampleEntity[] = extraExamples.map((example) => ({
    id: 0,
    questionId: globalExamples[0]?.questionId ?? 0,
    checkpointKey: example.checkpointKey,
    exampleType: example.exampleType,
    exampleText: example.exampleText,
    sortOrder: example.sortOrder,
    createdAt: new Date(0),
  }));

  return [...globalExamples, ...appended].map((example, index) => ({
    ...example,
    sortOrder: index,
  }));
}

export function mergeQuestionWithOverride(
  globalQuestion: QuestionWithDetailsEntity,
  override: CompanyQuestionOverrideMergeData,
): MergeQuestionWithOverrideResult {
  const checkpoints = globalQuestion.checkpoints.map((checkpoint) => ({
    ...checkpoint,
    evaluationHints: mergeEvaluationHints(
      checkpoint.evaluationHints,
      override,
    ),
  }));

  const answerExamples = mergeAnswerExamples(
    globalQuestion.answerExamples,
    override.extraAnswerExamples,
  );

  return {
    question: {
      ...globalQuestion,
      checkpoints,
      answerExamples,
    },
    topicWeightOverride:
      override.topicWeightOverride != null
        ? override.topicWeightOverride
        : undefined,
  };
}
