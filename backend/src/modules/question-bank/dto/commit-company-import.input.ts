import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { QuestionStatusEnum } from '../types/question.type';

@InputType()
export class CommitCompanyQuestionImportInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  importToken!: string;

  @Field(() => QuestionStatusEnum, { nullable: true })
  @IsOptional()
  @IsEnum(QuestionStatusEnum)
  status?: QuestionStatusEnum;
}
