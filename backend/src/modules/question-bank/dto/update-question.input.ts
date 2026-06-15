import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateQuestionInput } from './create-question.input';

@InputType()
export class UpdateQuestionInput extends CreateQuestionInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id!: string;
}
