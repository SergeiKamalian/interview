import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { CheckpointResultType } from './checkpoint-result.type';

@ObjectType()
export class QuestionEvaluationType {
  @Field()
  id!: string;

  @Field()
  interviewAttemptId!: string;

  @Field()
  interviewMessageId!: string;

  @Field()
  interviewQuestionId!: string;

  @Field(() => Float)
  score!: number;

  @Field(() => Float)
  maxScore!: number;

  @Field(() => String, { nullable: true })
  shortSummary?: string | null;

  @Field(() => String, { nullable: true })
  review?: string | null;

  @Field()
  needsManualReview!: boolean;

  @Field(() => Int)
  createdAt!: number;

  @Field(() => [CheckpointResultType])
  checkpointResults!: CheckpointResultType[];
}
