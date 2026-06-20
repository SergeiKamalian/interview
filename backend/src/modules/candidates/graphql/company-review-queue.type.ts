import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import {
  AchievedLevelMethodEnum,
  HireRecommendationEnum,
} from '../../ai-evaluation/graphql/final-evaluation.type';
import { QuestionLevelEnum } from '../../question-bank/types/question.type';
import {
  AiAssessmentVerdictEnum,
  AttemptReviewStatusEnum,
  CompanyAttemptDecisionEnum,
} from '../../attempt-review/graphql/attempt-review.type';

@ObjectType()
export class CompanyReviewQueueItemType {
  @Field()
  attemptId!: string;

  @Field()
  candidateId!: string;

  @Field()
  candidateName!: string;

  @Field()
  candidateEmail!: string;

  @Field()
  interviewId!: string;

  @Field()
  interviewTitle!: string;

  @Field()
  jobRole!: string;

  @Field(() => Int, { nullable: true })
  completedAt?: number | null;

  @Field()
  evaluationStatus!: string;

  @Field(() => Float, { nullable: true })
  totalScore?: number | null;

  @Field(() => HireRecommendationEnum, { nullable: true })
  hireRecommendation?: HireRecommendationEnum | null;

  @Field(() => QuestionLevelEnum, { nullable: true })
  achievedLevel?: QuestionLevelEnum | null;

  @Field(() => AchievedLevelMethodEnum, { nullable: true })
  achievedLevelMethod?: AchievedLevelMethodEnum | null;

  @Field()
  needsManualReview!: boolean;

  @Field()
  shortlistStatus!: string;

  @Field(() => AttemptReviewStatusEnum)
  reviewStatus!: AttemptReviewStatusEnum;

  @Field(() => AiAssessmentVerdictEnum)
  aiAssessmentVerdict!: AiAssessmentVerdictEnum;

  @Field(() => CompanyAttemptDecisionEnum)
  companyDecision!: CompanyAttemptDecisionEnum;

  @Field(() => Int, { nullable: true })
  reviewedAt?: number | null;
}

@ObjectType()
export class CompanyReviewQueuePayloadType {
  @Field(() => [CompanyReviewQueueItemType])
  items!: CompanyReviewQueueItemType[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  pageSize!: number;
}
