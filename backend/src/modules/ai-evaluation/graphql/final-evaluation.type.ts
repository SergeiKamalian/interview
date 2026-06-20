import { Field, Float, ObjectType, registerEnumType } from '@nestjs/graphql';
import { QuestionLevelEnum } from '../../question-bank/types/question.type';

export enum AchievedLevelMethodEnum {
  evidence = 'evidence',
  estimate = 'estimate',
}

registerEnumType(AchievedLevelMethodEnum, {
  name: 'AchievedLevelMethod',
});

export enum InterviewStrengthCategoryEnum {
  weak = 'weak',
  medium = 'medium',
  strong = 'strong',
}

export enum FinalEvaluationCategoryEnum {
  weak = 'weak',
  basic = 'basic',
  average = 'average',
  good = 'good',
  strong = 'strong',
}

export enum HireRecommendationEnum {
  strong_reject = 'strong_reject',
  reject = 'reject',
  maybe = 'maybe',
  invite = 'invite',
  strong_invite = 'strong_invite',
}

registerEnumType(InterviewStrengthCategoryEnum, {
  name: 'InterviewStrengthCategory',
});

registerEnumType(FinalEvaluationCategoryEnum, {
  name: 'FinalEvaluationCategory',
});

registerEnumType(HireRecommendationEnum, {
  name: 'HireRecommendation',
});

@ObjectType()
export class TopicSessionEvaluationType {
  @Field()
  topic!: string;

  @Field(() => Float)
  score!: number;

  @Field(() => Float)
  weight!: number;

  @Field(() => Float)
  weightedScore!: number;

  @Field(() => InterviewStrengthCategoryEnum)
  strengthCategory!: InterviewStrengthCategoryEnum;
}

@ObjectType()
export class CategoryBreakdownType {
  @Field()
  categoryKey!: string;

  @Field()
  categoryLabel!: string;

  @Field(() => Float)
  scoreNormalized!: number;

  @Field(() => Float)
  weight!: number;

  @Field(() => Float)
  contribution!: number;
}

@ObjectType()
export class LevelBreakdownType {
  @Field(() => QuestionLevelEnum)
  level!: QuestionLevelEnum;

  @Field(() => Float)
  earned!: number;

  @Field(() => Float)
  maxScore!: number;

  @Field(() => Float)
  ratio!: number;

  @Field()
  passed!: boolean;
}

@ObjectType()
export class FinalEvaluationType {
  @Field()
  id!: string;

  @Field()
  interviewAttemptId!: string;

  @Field(() => Float)
  totalScore!: number;

  @Field(() => Float)
  finalScore!: number;

  @Field(() => Float)
  totalWeight!: number;

  @Field(() => Float, { nullable: true })
  averageScore?: number | null;

  @Field(() => InterviewStrengthCategoryEnum)
  strengthCategory!: InterviewStrengthCategoryEnum;

  @Field(() => FinalEvaluationCategoryEnum)
  category!: FinalEvaluationCategoryEnum;

  @Field(() => HireRecommendationEnum)
  hireRecommendation!: HireRecommendationEnum;

  /** Demonstrated level — separate axis from hireRecommendation (TASK-18). */
  @Field(() => QuestionLevelEnum, { nullable: true })
  achievedLevel?: QuestionLevelEnum | null;

  @Field(() => AchievedLevelMethodEnum, { nullable: true })
  achievedLevelMethod?: AchievedLevelMethodEnum | null;

  /** Human-facing note (e.g. calibration hint when method === 'estimate'). */
  @Field(() => String, { nullable: true })
  achievedLevelNote?: string | null;

  /** Interview target level (interviews.level), null when unknown. */
  @Field(() => QuestionLevelEnum, { nullable: true })
  targetLevel?: QuestionLevelEnum | null;

  /** Per-level score aggregation, ordered junior→lead, only present levels. */
  @Field(() => [LevelBreakdownType])
  levelBreakdown!: LevelBreakdownType[];

  @Field()
  summary!: string;

  @Field(() => String, { nullable: true })
  detailedSummary?: string | null;

  @Field(() => [String])
  strengths!: string[];

  @Field(() => [String])
  weaknesses!: string[];

  @Field(() => [String])
  risks!: string[];

  @Field()
  needsManualReview!: boolean;

  @Field(() => [CategoryBreakdownType])
  categoryBreakdown!: CategoryBreakdownType[];

  @Field(() => [TopicSessionEvaluationType])
  topicEvaluations!: TopicSessionEvaluationType[];
}
