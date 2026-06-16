import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class BeginInterviewAttemptInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  publicToken!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  attemptId!: string;
}
