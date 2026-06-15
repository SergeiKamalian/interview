import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

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
  @IsNotEmpty()
  @MaxLength(5000)
  answer!: string;
}
