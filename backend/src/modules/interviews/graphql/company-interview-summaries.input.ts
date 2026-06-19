import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { InterviewStatusEnum } from '../../interview-core/types/interview.type';
import { QuestionLevelEnum } from '../../question-bank/types/question.type';

export enum CompanyInterviewSummariesSortField {
  CREATED_AT = 'created_at',
  LAST_ACTIVITY_AT = 'last_activity_at',
  ATTEMPTS_TOTAL = 'attempts_total',
  AVG_SCORE = 'avg_score',
  COMPLETION_RATE = 'completion_rate',
}

@InputType()
export class CompanyInterviewSummariesFilterInput {
  @Field(() => InterviewStatusEnum, { nullable: true })
  @IsOptional()
  status?: InterviewStatusEnum;

  @Field(() => QuestionLevelEnum, { nullable: true })
  @IsOptional()
  level?: QuestionLevelEnum;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  interviewLanguage?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  hasAttemptsOnly?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page!: number;

  @Field(() => Int, { defaultValue: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize!: number;

  @Field(() => String, {
    defaultValue: CompanyInterviewSummariesSortField.LAST_ACTIVITY_AT,
  })
  @IsOptional()
  @IsString()
  sort!: string;

  @Field({ defaultValue: 'desc' })
  @IsOptional()
  @IsString()
  sortDirection!: string;
}
