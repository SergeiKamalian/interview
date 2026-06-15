import { Field, Float, InputType } from '@nestjs/graphql';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  QuestionDifficultyEnum,
  QuestionLevelEnum,
} from '../types/question.type';
import { AnswerExampleInput } from './answer-example.input';
import { CheckpointInput } from './checkpoint.input';

@InputType()
export class CreateQuestionInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  professionId!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  topicId!: string;

  @Field(() => QuestionLevelEnum)
  level!: QuestionLevelEnum;

  @Field(() => QuestionDifficultyEnum)
  difficulty!: QuestionDifficultyEnum;

  @Field()
  @IsString()
  @MinLength(30)
  @MaxLength(2000)
  questionText!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  shortAnswer!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  idealAnswer!: string;

  @Field(() => Float)
  @IsNumber()
  maxScore!: number;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  skillIds!: string[];

  @Field(() => [CheckpointInput])
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CheckpointInput)
  checkpoints!: CheckpointInput[];

  @Field(() => [AnswerExampleInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerExampleInput)
  answerExamples!: AnswerExampleInput[];
}
