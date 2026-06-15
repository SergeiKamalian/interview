import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ANSWER_EXAMPLE_TYPES } from './answer-example-type.enum';

export enum AnswerExampleTypeEnum {
  good = 'good',
  bad = 'bad',
}

registerEnumType(AnswerExampleTypeEnum, {
  name: 'AnswerExampleType',
});

@ObjectType()
export class QuestionAnswerExampleType {
  @Field()
  id!: string;

  @Field(() => AnswerExampleTypeEnum)
  exampleType!: AnswerExampleTypeEnum;

  @Field()
  exampleText!: string;

  @Field(() => Int)
  sortOrder!: number;
}

export const GRAPHQL_ANSWER_EXAMPLE_TYPES = ANSWER_EXAMPLE_TYPES;
