import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AiUsageCostSummaryType {
  @Field(() => Int)
  totalRequests!: number;

  @Field(() => Int)
  totalPromptTokens!: number;

  @Field(() => Int)
  totalCompletionTokens!: number;

  @Field(() => Float)
  totalCostUsd!: number;
}
