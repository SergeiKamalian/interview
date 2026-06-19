import { Field, ID, InputType, Int } from '@nestjs/graphql';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { QuestionLevelEnum } from '../../question-bank/types/question.type';

@InputType()
export class CompanyInterviewTemplatesFilterInput {
  @Field(() => QuestionLevelEnum, { nullable: true })
  @IsOptional()
  @IsEnum(QuestionLevelEnum)
  level?: QuestionLevelEnum;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  includeArchived?: boolean;

  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page!: number;

  @Field(() => Int, { defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize!: number;
}

@InputType()
export class CreateInterviewTemplateInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  jobRole!: string;

  @Field(() => QuestionLevelEnum)
  @IsEnum(QuestionLevelEnum)
  level!: QuestionLevelEnum;

  @Field({ nullable: true, defaultValue: 'ru' })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  interviewLanguage?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  jobDescription?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  professionId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isVideoEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  interviewerName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  welcomeMessageTemplate?: string;

  @Field(() => [ID])
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  questionIds!: string[];
}
