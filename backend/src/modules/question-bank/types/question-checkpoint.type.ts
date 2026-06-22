import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { CheckpointEvaluationHintsType } from './checkpoint-evaluation-hints-output.type';

@ObjectType()
export class QuestionCheckpointType {
  @Field()
  id!: string;

  @Field()
  checkpointKey!: string;

  @Field()
  title!: string;

  @Field()
  expected!: string;

  @Field(() => Float)
  score!: number;

  @Field(() => Int)
  sortOrder!: number;

  @Field(() => CheckpointEvaluationHintsType, { nullable: true })
  evaluationHints?: CheckpointEvaluationHintsType | null;
}
