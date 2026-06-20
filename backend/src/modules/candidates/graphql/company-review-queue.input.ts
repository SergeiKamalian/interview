import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

@InputType()
export class CompanyReviewQueueFilterInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  evaluationStatus?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  shortlistedOnly?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  manualReviewOnly?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  unreviewedOnly?: boolean;

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

  @Field({ defaultValue: 'completed_at' })
  @IsOptional()
  @IsString()
  sort!: string;

  @Field({ defaultValue: 'desc' })
  @IsOptional()
  @IsString()
  sortDirection!: string;
}
