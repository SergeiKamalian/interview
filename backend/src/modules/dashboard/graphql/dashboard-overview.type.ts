import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { HireRecommendationEnum } from '../../ai-evaluation/graphql/final-evaluation.type';
import { CompanyInterviewSummaryItemType } from '../../interviews/graphql/company-interview-summaries.type';
import { DashboardAttentionKindEnum } from './dashboard-attention-kind.enum';

@ObjectType()
export class DashboardMetricsType {
  @Field(() => Int)
  candidatesTotal!: number;

  @Field(() => Int)
  completedTotal!: number;

  @Field(() => Int)
  inProgressTotal!: number;

  @Field(() => Int)
  shortlistedTotal!: number;

  @Field(() => Int)
  abandonedTotal!: number;

  @Field(() => Int)
  needsReviewTotal!: number;

  @Field(() => Int)
  strongInviteTotal!: number;

  @Field(() => Float, { nullable: true })
  completionRate?: number | null;

  @Field(() => Int)
  interviewsTotal!: number;

  @Field(() => Int)
  activeInterviewsTotal!: number;
}

@ObjectType()
export class DashboardAttentionItemType {
  @Field(() => DashboardAttentionKindEnum)
  kind!: DashboardAttentionKindEnum;

  @Field()
  attemptId!: string;

  @Field()
  interviewId!: string;

  @Field()
  interviewTitle!: string;

  @Field()
  jobRole!: string;

  @Field()
  candidateId!: string;

  @Field()
  candidateName!: string;

  @Field(() => Float, { nullable: true })
  overallScore?: number | null;

  @Field(() => HireRecommendationEnum, { nullable: true })
  hireRecommendation?: HireRecommendationEnum | null;

  @Field(() => Int)
  occurredAt!: number;
}

@ObjectType()
export class DashboardShortlistPreviewItemType {
  @Field()
  candidateId!: string;

  @Field()
  fullName!: string;

  @Field()
  email!: string;

  @Field(() => Int)
  interviewsCount!: number;

  @Field(() => Float, { nullable: true })
  avgScore?: number | null;

  @Field(() => Int, { nullable: true })
  lastInterviewDate?: number | null;
}

@ObjectType()
export class DashboardWeakTopicType {
  @Field()
  topicName!: string;

  @Field(() => Float)
  avgScore!: number;

  @Field(() => Float)
  passRate!: number;

  @Field(() => Int)
  sampleCount!: number;
}

@ObjectType()
export class CompanyDashboardOverviewType {
  @Field(() => DashboardMetricsType)
  metrics!: DashboardMetricsType;

  @Field(() => [CompanyInterviewSummaryItemType])
  interviews!: CompanyInterviewSummaryItemType[];

  @Field(() => Int)
  interviewsTotal!: number;

  @Field(() => [DashboardAttentionItemType])
  attentionItems!: DashboardAttentionItemType[];

  @Field(() => [DashboardShortlistPreviewItemType])
  shortlistPreview!: DashboardShortlistPreviewItemType[];

  @Field(() => Int)
  shortlistTotal!: number;

  @Field(() => [DashboardWeakTopicType])
  weakTopics!: DashboardWeakTopicType[];
}
