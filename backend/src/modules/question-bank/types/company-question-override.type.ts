import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { AnswerExampleTypeEnum } from './question-answer-example.type';

@ObjectType()
export class OverrideAnswerExampleType {
  @Field(() => AnswerExampleTypeEnum)
  exampleType!: AnswerExampleTypeEnum;

  @Field()
  exampleText!: string;

  @Field(() => Int)
  sortOrder!: number;

  @Field(() => String, { nullable: true })
  checkpointKey?: string | null;
}

@ObjectType()
export class CompanyQuestionOverrideType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  sourceQuestionId!: string;

  @Field(() => [String], { nullable: true })
  extraMustConcepts?: string[] | null;

  @Field(() => [String], { nullable: true })
  extraFalseClaims?: string[] | null;

  @Field(() => [OverrideAnswerExampleType], { nullable: true })
  extraAnswerExamples?: OverrideAnswerExampleType[] | null;

  @Field(() => Float, { nullable: true })
  topicWeightOverride?: number | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
