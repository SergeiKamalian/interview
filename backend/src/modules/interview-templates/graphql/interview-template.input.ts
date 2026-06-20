import { Field, Float, ID, InputType, Int } from '@nestjs/graphql';
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
} from 'class-validator';
import { QuestionLevelEnum } from '../../question-bank/types/question.type';
import {
  AiToneEnum,
  PASSING_SCORE_MAX,
  PASSING_SCORE_MIN,
  ProbingDepthEnum,
  ScoringStrictnessEnum,
} from '../../interview-core/types/interview-config.enum';

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

  @Field(() => AiToneEnum, { nullable: true })
  @IsOptional()
  @IsEnum(AiToneEnum)
  aiTone?: AiToneEnum;

  @Field(() => ProbingDepthEnum, { nullable: true })
  @IsOptional()
  @IsEnum(ProbingDepthEnum)
  probingDepth?: ProbingDepthEnum;

  @Field(() => ScoringStrictnessEnum, { nullable: true })
  @IsOptional()
  @IsEnum(ScoringStrictnessEnum)
  scoringStrictness?: ScoringStrictnessEnum;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxCompletions?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  allowRetake?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimitMinutes?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(PASSING_SCORE_MIN)
  @Max(PASSING_SCORE_MAX)
  passingScore?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  requirePhone?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  requireLinkedin?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  requireGithub?: boolean;

  @Field(() => [ID])
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  questionIds!: string[];
}
