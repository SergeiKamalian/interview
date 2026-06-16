import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AiCostKpiType {
  @Field(() => Float)
  totalCostUsd!: number;

  @Field(() => Float)
  costPerInterview!: number;

  @Field(() => Float)
  costPerCandidate!: number;

  @Field(() => Int)
  totalRequests!: number;
}

@ObjectType()
export class AiCostByModelType {
  @Field()
  model!: string;

  @Field(() => Int)
  promptTokens!: number;

  @Field(() => Int)
  completionTokens!: number;

  @Field(() => Float)
  totalCostUsd!: number;
}

@ObjectType()
export class ExpensiveInterviewType {
  @Field()
  interviewAttemptId!: string;

  @Field(() => String, { nullable: true })
  interviewTitle?: string | null;

  @Field(() => Float)
  totalCostUsd!: number;

  @Field(() => Int, { nullable: true })
  latencyMs?: number | null;
}

@ObjectType()
export class ElevenLabsCostKpiType {
  @Field(() => Float)
  totalCostUsd!: number;

  @Field(() => Int)
  totalCharacters!: number;

  @Field(() => Int)
  totalRequests!: number;
}

@ObjectType()
export class ElevenLabsCostByOperationType {
  @Field()
  operationType!: string;

  @Field(() => Int)
  characterCount!: number;

  @Field(() => Float)
  totalCostUsd!: number;
}

@ObjectType()
export class ElevenLabsCostAnalyticsType {
  @Field(() => ElevenLabsCostKpiType)
  kpi!: ElevenLabsCostKpiType;

  @Field(() => [ElevenLabsCostByOperationType])
  byOperation!: ElevenLabsCostByOperationType[];
}

@ObjectType()
export class AiCostAnalyticsType {
  @Field(() => AiCostKpiType)
  kpi!: AiCostKpiType;

  @Field(() => [AiCostByModelType])
  byModel!: AiCostByModelType[];

  @Field(() => [ExpensiveInterviewType])
  topExpensiveInterviews!: ExpensiveInterviewType[];

  @Field(() => ElevenLabsCostAnalyticsType)
  elevenLabs!: ElevenLabsCostAnalyticsType;
}
