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
export class CreateCompanyQuestionPlaybookInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @Field(() => ID)
  @IsNotEmpty()
  professionId!: string;

  @Field(() => QuestionLevelEnum)
  @IsEnum(QuestionLevelEnum)
  level!: QuestionLevelEnum;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  skillIds?: string[];

  @Field(() => [CompanyQuestionPlaybookItemInput])
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CompanyQuestionPlaybookItemInput)
  items!: CompanyQuestionPlaybookItemInput[];
}
