import { Field, InputType, Int } from '@nestjs/graphql';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { QuestionLevelEnum } from '../types/question.type';

@InputType()
export class SuggestInterviewQuestionsInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  professionId!: string;

  @Field(() => QuestionLevelEnum, { nullable: true })
  @IsOptional()
  level?: QuestionLevelEnum;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  skillIds?: string[];

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  count?: number;

  /** Question ids to exclude from AI/fallback pool (e.g. playbook items already selected). */
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  excludeQuestionIds?: string[];
}
