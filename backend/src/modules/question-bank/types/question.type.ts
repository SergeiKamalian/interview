import { Field, Float, ObjectType, registerEnumType } from '@nestjs/graphql';
import { QUESTION_DIFFICULTIES } from './question-difficulty.enum';
import { QUESTION_LEVELS } from './question-level.enum';
import { ProfessionType } from './profession.type';
import { QuestionAnswerExampleType } from './question-answer-example.type';
import { QuestionCheckpointType } from './question-checkpoint.type';
import { SkillType } from './skill.type';
import { TopicType } from './topic.type';

export enum QuestionLevelEnum {
  junior = 'junior',
  middle = 'middle',
  senior = 'senior',
  lead = 'lead',
}

export enum QuestionDifficultyEnum {
  basic = 'basic',
  intermediate = 'intermediate',
  advanced = 'advanced',
}

registerEnumType(QuestionLevelEnum, { name: 'QuestionLevel' });
registerEnumType(QuestionDifficultyEnum, { name: 'QuestionDifficulty' });

@ObjectType()
export class QuestionType {
  @Field()
  id!: string;

  @Field(() => String, { nullable: true })
  companyId?: string | null;

  @Field()
  questionText!: string;

  @Field()
  shortAnswer!: string;

  @Field()
  idealAnswer!: string;

  @Field(() => Float)
  maxScore!: number;

  @Field(() => QuestionLevelEnum)
  level!: QuestionLevelEnum;

  @Field(() => QuestionDifficultyEnum)
  difficulty!: QuestionDifficultyEnum;

  @Field()
  isActive!: boolean;

  @Field(() => ProfessionType)
  profession!: ProfessionType;

  @Field(() => TopicType)
  topic!: TopicType;

  @Field(() => [SkillType])
  skills!: SkillType[];

  @Field(() => [QuestionCheckpointType])
  checkpoints!: QuestionCheckpointType[];

  @Field(() => [QuestionAnswerExampleType])
  answerExamples!: QuestionAnswerExampleType[];
}

@ObjectType()
export class QuestionBankListPayload {
  @Field(() => [QuestionType])
  items!: QuestionType[];

  @Field()
  total!: number;
}

export const GRAPHQL_QUESTION_LEVELS = QUESTION_LEVELS;
export const GRAPHQL_QUESTION_DIFFICULTIES = QUESTION_DIFFICULTIES;
