import { Field, InputType, Int } from '@nestjs/graphql';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  QuestionDifficultyEnum,
  QuestionLevelEnum,
  QuestionStatusEnum,
} from '../types/question.type';
import { QuestionScopeEnum } from '../types/question-scope.type';

@InputType()
export class QuestionBankFilterInput {
  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2000)
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  professionId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  topicId?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  skillIds?: string[];

  @Field(() => QuestionLevelEnum, { nullable: true })
  @IsOptional()
  level?: QuestionLevelEnum;

  @Field(() => QuestionDifficultyEnum, { nullable: true })
  @IsOptional()
  difficulty?: QuestionDifficultyEnum;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => QuestionScopeEnum, { nullable: true })
  @IsOptional()
  @IsEnum(QuestionScopeEnum)
  scope?: QuestionScopeEnum;

  @Field(() => QuestionStatusEnum, { nullable: true })
  @IsOptional()
  @IsEnum(QuestionStatusEnum)
  status?: QuestionStatusEnum;

  /** When true, global questions replaced by a published company fork stay visible. */
  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  includeForkReplacedGlobal?: boolean;
}
