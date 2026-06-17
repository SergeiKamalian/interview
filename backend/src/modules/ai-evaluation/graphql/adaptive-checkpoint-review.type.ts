import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AdaptiveCheckpointStateType {
  @Field()
  checkpointKey!: string;

  @Field()
  checkpointTitle!: string;

  @Field()
  status!: string;

  @Field(() => Float)
  scoreAwarded!: number;

  @Field(() => Float)
  maxScore!: number;

  @Field(() => String, { nullable: true })
  rationale?: string | null;

  @Field(() => String, { nullable: true })
  evidenceSummary?: string | null;

  @Field(() => Float, { nullable: true })
  confidence?: number | null;

  @Field()
  needsManualReview!: boolean;

  @Field()
  depthLabel!: string;

  @Field()
  probeStatus!: string;

  @Field(() => Float)
  coveragePercent!: number;

  @Field(() => Float)
  accuracyPercent!: number;
}

@ObjectType()
export class InterviewRedFlagType {
  @Field()
  checkpointKey!: string;

  @Field()
  checkpointTitle!: string;

  @Field()
  summary!: string;

  @Field(() => String, { nullable: true })
  candidateQuote?: string | null;

  @Field()
  severity!: string;
}

@ObjectType()
export class AdaptiveQuestionReviewType {
  @Field()
  interviewQuestionId!: string;

  @Field()
  questionText!: string;

  @Field(() => String, { nullable: true })
  idealAnswer?: string | null;

  @Field()
  needsManualReview!: boolean;

  @Field(() => [AdaptiveCheckpointStateType])
  checkpoints!: AdaptiveCheckpointStateType[];
}

@ObjectType()
export class AdaptiveCheckpointReviewType {
  @Field()
  attemptId!: string;

  @Field()
  needsManualReview!: boolean;

  @Field(() => [InterviewRedFlagType])
  redFlags!: InterviewRedFlagType[];

  @Field(() => [AdaptiveQuestionReviewType])
  questionGroups!: AdaptiveQuestionReviewType[];
}
