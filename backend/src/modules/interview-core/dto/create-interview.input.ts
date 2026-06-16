import { Field, InputType, Int } from '@nestjs/graphql';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { QuestionLevelEnum } from '../../question-bank/types/question.type';

@InputType()
export class CreateInterviewInput {
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

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  questionCount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  jobDescription?: string;

  @Field({ nullable: true })
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

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  questionIds!: string[];
}
