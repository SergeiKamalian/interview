import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { QuestionLevelEnum } from './question.type';

@ObjectType()
export class CompanyQuestionPlaybookItemType {
  @Field(() => ID)
  questionId!: string;

  @Field(() => Int)
  sortOrder!: number;

  @Field()
  isPinned!: boolean;
}

@ObjectType()
export class CompanyQuestionPlaybookType {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => ID)
  professionId!: string;

  @Field(() => QuestionLevelEnum)
  level!: QuestionLevelEnum;

  @Field(() => [ID], { nullable: true })
  skillIds?: string[] | null;

  @Field()
  isActive!: boolean;

  @Field(() => [CompanyQuestionPlaybookItemType])
  items!: CompanyQuestionPlaybookItemType[];

  @Field(() => Int)
  itemCount!: number;

  @Field(() => Int)
  pinnedCount!: number;
}

@ObjectType()
export class ApplyPlaybookToInterviewDraftPayload {
  @Field(() => [String])
  questionIds!: string[];

  @Field(() => [String])
  pinnedQuestionIds!: string[];

  @Field(() => Int)
  count!: number;
}
