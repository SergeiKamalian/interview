import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsNotEmpty, Min } from 'class-validator';

@InputType()
export class CompanyQuestionPlaybookItemInput {
  @Field(() => ID)
  @IsNotEmpty()
  questionId!: string;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @Min(0)
  sortOrder!: number;

  @Field({ defaultValue: false })
  @IsBoolean()
  isPinned!: boolean;
}
