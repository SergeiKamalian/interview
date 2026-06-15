import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

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
}
