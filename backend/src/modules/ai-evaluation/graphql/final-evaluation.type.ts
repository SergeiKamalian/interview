import { Field, Float, ObjectType, registerEnumType } from '@nestjs/graphql';

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
