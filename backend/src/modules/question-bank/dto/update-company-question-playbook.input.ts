import { Field, ID, InputType } from '@nestjs/graphql';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionLevelEnum } from '../types/question.type';
import { CompanyQuestionPlaybookItemInput } from './company-question-playbook-item.input';

@InputType()
export class UpdateCompanyQuestionPlaybookInput {
  @Field(() => ID)
  @IsNotEmpty()
  id!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  professionId?: string;

  @Field(() => QuestionLevelEnum, { nullable: true })
  @IsOptional()
  @IsEnum(QuestionLevelEnum)
  level?: QuestionLevelEnum;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  skillIds?: string[] | null;

  @Field(() => [CompanyQuestionPlaybookItemInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CompanyQuestionPlaybookItemInput)
  items?: CompanyQuestionPlaybookItemInput[];
}
