import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { AttemptStatusEnum } from '../../interview-core/types/interview.type';

export enum CompanyInterviewsSortField {
  CREATED_AT = 'created_at',
  OVERALL_SCORE = 'overall_score',
}

@InputType()
export class CompanyInterviewsFilterInput {
  @Field(() => AttemptStatusEnum, { nullable: true })
  @IsOptional()
  status?: AttemptStatusEnum;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

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

  @Field(() => String, { defaultValue: CompanyInterviewsSortField.CREATED_AT })
  @IsOptional()
  @IsString()
  sort!: string;

  @Field({ defaultValue: 'desc' })
  @IsOptional()
  @IsString()
  sortDirection!: string;
}
