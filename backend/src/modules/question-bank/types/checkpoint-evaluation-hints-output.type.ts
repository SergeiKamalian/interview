import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CheckpointEvaluationHintsType {
  @Field(() => [String], { nullable: true })
  mustConcepts?: string[];

  @Field(() => [String], { nullable: true })
  falseClaims?: string[];

  @Field(() => Int, { nullable: true })
  minMatchedConcepts?: number;

  @Field(() => Float, { nullable: true })
  positiveFloorScore?: number;
}
