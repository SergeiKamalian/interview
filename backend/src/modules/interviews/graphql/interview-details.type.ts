import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import {
  AttemptStatusEnum,
  InterviewStatusEnum,
} from '../../interview-core/types/interview.type';
import {
  FinalEvaluationType,
  HireRecommendationEnum,
} from '../../ai-evaluation/graphql/final-evaluation.type';

@ObjectType()
export class InterviewAttemptSummaryType {
  @Field()
  attemptId!: string;

  @Field()
  candidateId!: string;

  @Field()
  candidateName!: string;

  @Field()
  candidateEmail!: string;

  @Field(() => AttemptStatusEnum)
  status!: AttemptStatusEnum;

  @Field(() => Int, { nullable: true })
  startedAt?: number | null;

  @Field(() => Int, { nullable: true })
  completedAt?: number | null;

  @Field(() => Float, { nullable: true })
  overallScore?: number | null;

  @Field(() => HireRecommendationEnum, { nullable: true })
  hireRecommendation?: HireRecommendationEnum | null;

  @Field()
  evaluationStatus!: string;
}

@ObjectType()
export class InterviewDetailsType {
  @Field()
  id!: string;

  @Field()
  title!: string;

  @Field()
  jobRole!: string;

  @Field(() => InterviewStatusEnum)
  status!: InterviewStatusEnum;

  @Field(() => Int)
  questionCount!: number;

  @Field()
  publicUrl!: string;

  @Field(() => Int)
  createdAt!: number;

  @Field(() => [InterviewAttemptSummaryType])
  attempts!: InterviewAttemptSummaryType[];

  @Field(() => FinalEvaluationType, { nullable: true })
  primaryFinalEvaluation?: FinalEvaluationType | null;

  @Field()
  evaluationStatus!: string;
}
