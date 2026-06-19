import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { QuestionLevelEnum } from '../../question-bank/types/question.type';
import {
  InterviewStatusEnum,
} from '../../interview-core/types/interview.type';

@ObjectType()
export class CompanyInterviewSummaryItemType {
  @Field()
  interviewId!: string;

  @Field()
  title!: string;

  @Field()
  jobRole!: string;

  @Field(() => InterviewStatusEnum)
  status!: InterviewStatusEnum;

  @Field(() => QuestionLevelEnum)
  level!: QuestionLevelEnum;

  @Field()
  interviewLanguage!: string;

  @Field(() => Int)
  questionCount!: number;

  @Field()
  publicUrl!: string;

  @Field(() => Int)
  createdAt!: number;

  @Field(() => Int)
  attemptsTotal!: number;

  @Field(() => Int)
  attemptsCompleted!: number;

  @Field(() => Int)
  attemptsInProgress!: number;

  @Field(() => Int)
  attemptsAbandoned!: number;

  @Field(() => Int)
  attemptsPending!: number;

  @Field(() => Float, { nullable: true })
  completionRate?: number | null;

  @Field(() => Int)
  shortlistedCount!: number;

  @Field(() => Int)
  strongInviteCount!: number;

  @Field(() => Int)
  needsManualReviewCount!: number;

  @Field(() => Float, { nullable: true })
  avgScore?: number | null;

  @Field(() => Int, { nullable: true })
  lastActivityAt?: number | null;
}

@ObjectType()
export class CompanyInterviewSummaryFacetsType {
  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  active!: number;

  @Field(() => Int)
  draft!: number;

  @Field(() => Int)
  archived!: number;

  @Field(() => Int)
  withAttempts!: number;
}

@ObjectType()
export class CompanyInterviewSummariesPayloadType {
  @Field(() => [CompanyInterviewSummaryItemType])
  items!: CompanyInterviewSummaryItemType[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  pageSize!: number;

  @Field(() => CompanyInterviewSummaryFacetsType)
  facets!: CompanyInterviewSummaryFacetsType;
}
