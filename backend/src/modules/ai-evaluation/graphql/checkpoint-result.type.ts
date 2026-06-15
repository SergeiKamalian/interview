import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CheckpointResultType {
  @Field()
  id!: string;

  @Field()
  checkpointKey!: string;

  @Field()
  matched!: boolean;

  @Field(() => Float)
  scoreAwarded!: number;

  @Field(() => String, { nullable: true })
  evidenceQuote?: string | null;
}
