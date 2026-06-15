import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { AttemptStatusEnum } from '../../interview-core/types/interview.type';
import { FinalEvaluationType } from '../../ai-evaluation/graphql/final-evaluation.type';

@ObjectType()
export class CandidateInterviewHistoryItemType {
  @Field()
  attemptId!: string;

  @Field()
  interviewId!: string;

  @Field()
  interviewTitle!: string;

  @Field()
  jobRole!: string;

  @Field(() => AttemptStatusEnum)
  status!: AttemptStatusEnum;

  @Field(() => Int, { nullable: true })
  completedAt?: number | null;

  @Field(() => Float, { nullable: true })
  totalScore?: number | null;
}

@ObjectType()
export class CandidateReportType {
  @Field()
  candidateId!: string;

  @Field()
  fullName!: string;

  @Field()
  email!: string;

  @Field(() => String, { nullable: true })
  phone?: string | null;

  @Field(() => String, { nullable: true })
  linkedinUrl?: string | null;

  @Field(() => String, { nullable: true })
  githubUrl?: string | null;

  @Field()
  shortlistStatus!: string;

  @Field(() => String, { nullable: true })
  shortlistReason?: string | null;

  @Field(() => [CandidateInterviewHistoryItemType])
  interviewHistory!: CandidateInterviewHistoryItemType[];

  @Field(() => FinalEvaluationType, { nullable: true })
  latestFinalEvaluation?: FinalEvaluationType | null;
}
