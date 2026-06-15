import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { QuestionLevelEnum } from '../../question-bank/types/question.type';

@InputType()
export class TopicSkillQuestionFilterInput {
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
  jobRole?: string;

  @Field(() => QuestionLevelEnum, { nullable: true })
  @IsOptional()
  @IsEnum(QuestionLevelEnum)
  level?: QuestionLevelEnum;
}
