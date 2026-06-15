import { Field, Float, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum CheckpointMatchStatusEnum {
  met = 'met',
  partially_met = 'partially_met',
  not_met = 'not_met',
}

registerEnumType(CheckpointMatchStatusEnum, { name: 'CheckpointMatchStatus' });

@ObjectType()
export class CheckpointResultDetailType {
  @Field()
  id!: string;

  @Field()
  checkpointKey!: string;

  @Field()
  checkpointTitle!: string;

  @Field(() => CheckpointMatchStatusEnum)
  status!: CheckpointMatchStatusEnum;

  @Field(() => Float)
  scoreAwarded!: number;

  @Field(() => Float)
  maxScore!: number;

  @Field(() => String, { nullable: true })
  evidenceQuote?: string | null;

  @Field(() => String, { nullable: true })
  reasoningShort?: string | null;
}

@ObjectType()
export class QuestionCheckpointGroupType {
  @Field()
  interviewQuestionId!: string;

  @Field()
  questionText!: string;

  @Field()
  needsManualReview!: boolean;

  @Field(() => [CheckpointResultDetailType])
  checkpoints!: CheckpointResultDetailType[];
}

@ObjectType()
export class CheckpointResultsByAttemptType {
  @Field()
  attemptId!: string;

  @Field(() => [QuestionCheckpointGroupType])
  questionGroups!: QuestionCheckpointGroupType[];
}
