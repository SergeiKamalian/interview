import { Field, Float, ID, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AnswerExampleInput } from './answer-example.input';

@InputType()
export class UpsertCompanyQuestionOverrideInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  sourceQuestionId!: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  extraMustConcepts?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  extraFalseClaims?: string[];

  @Field(() => [AnswerExampleInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerExampleInput)
  extraAnswerExamples?: AnswerExampleInput[];

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  topicWeightOverride?: number;
}
