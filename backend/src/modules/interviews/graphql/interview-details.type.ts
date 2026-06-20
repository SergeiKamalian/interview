import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import {
  AttemptStatusEnum,
  InterviewStatusEnum,
} from '../../interview-core/types/interview.type';
import {
  AchievedLevelMethodEnum,
  FinalEvaluationType,
  HireRecommendationEnum,
} from '../../ai-evaluation/graphql/final-evaluation.type';
import { QuestionLevelEnum } from '../../question-bank/types/question.type';
import {
  AiAssessmentVerdictEnum,
  AttemptReviewStatusEnum,
  CompanyAttemptDecisionEnum,
} from '../../attempt-review/graphql/attempt-review.type';

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

  @Field()
  hasTeamNotes!: boolean;
}

@ObjectType()
export class InterviewDetailsQuestionType {
  @Field()
  id!: string;

  @Field(() => Int)
  sortOrder!: number;

  @Field()
  questionText!: string;

  @Field()
  level!: string;

  @Field()
  difficulty!: string;

  @Field(() => String, { nullable: true })
  topicName?: string | null;

  @Field(() => Float)
  maxScore!: number;
}

@ObjectType()
export class InterviewDetailsType {
  @Field()
  id!: string;

  @Field()
  title!: string;

  @Field()
  jobRole!: string;

  @Field(() => String, { nullable: true })
  professionName?: string | null;

  @Field()
  level!: string;

  @Field(() => InterviewStatusEnum)
  status!: InterviewStatusEnum;

  @Field(() => Int)
  questionCount!: number;

  @Field()
  publicUrl!: string;

  @Field(() => Int)
  createdAt!: number;

  @Field(() => [String])
  skills!: string[];

  @Field(() => [InterviewDetailsQuestionType])
  questions!: InterviewDetailsQuestionType[];

  @Field(() => [InterviewAttemptSummaryType])
  attempts!: InterviewAttemptSummaryType[];

  @Field(() => FinalEvaluationType, { nullable: true })
  primaryFinalEvaluation?: FinalEvaluationType | null;

  @Field()
  evaluationStatus!: string;
}

@ObjectType()
export class InterviewAttemptsPageType {
  @Field(() => [InterviewAttemptSummaryType])
  items!: InterviewAttemptSummaryType[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  pageSize!: number;
}
