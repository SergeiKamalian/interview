import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
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
} from '../types/interview-config.enum';

@InputType()
export class CreateInterviewInput {
  // TASK-17.8: trim leading/trailing whitespace so a stray space cannot create a
  // duplicate/awkward title or job_role (rendered verbatim in the candidate
  // welcome message). Spelling typos cannot be auto-corrected — this only
  // normalizes whitespace.
  @Field()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @Field()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
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

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

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

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  questionIds!: string[];
}
