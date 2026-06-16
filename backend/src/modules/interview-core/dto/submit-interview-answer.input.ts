import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class SubmitInterviewAnswerInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  publicToken!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  attemptId!: string;

  @Field()
  @IsString()
  @MaxLength(5000)
  answer!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  mediaAssetId?: string | null;
}
