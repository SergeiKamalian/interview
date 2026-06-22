import { Field, Float, InputType, Int } from '@nestjs/graphql';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  QuestionDifficultyEnum,
  QuestionLevelEnum,
  QuestionStatusEnum,
} from '../types/question.type';
import { AnswerExampleInput } from './answer-example.input';
import { CheckpointInput } from './checkpoint.input';

@InputType({ isAbstract: true })
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
  @IsEnum(QuestionLevelEnum)
  level!: QuestionLevelEnum;

  @Field(() => QuestionDifficultyEnum)
  @IsEnum(QuestionDifficultyEnum)
  difficulty!: QuestionDifficultyEnum;

  @Field()
  @IsString()
  @IsNotEmpty()
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

  @Field(() => QuestionStatusEnum, { nullable: true })
  @IsOptional()
  @IsEnum(QuestionStatusEnum)
  status?: QuestionStatusEnum;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  companyPriority?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}
