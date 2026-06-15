import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import {
  QuestionDifficultyEnum,
  QuestionLevelEnum,
} from '../types/question.type';

@InputType()
export class QuestionBankFilterInput {
  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
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
}
