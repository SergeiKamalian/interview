import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { AnswerExampleTypeEnum } from '../types/question-answer-example.type';

@InputType()
export class AnswerExampleInput {
  @Field(() => AnswerExampleTypeEnum)
  @IsEnum(AnswerExampleTypeEnum)
  exampleType!: AnswerExampleTypeEnum;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1500)
  exampleText!: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  sortOrder!: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  checkpointKey?: string | null;
}
