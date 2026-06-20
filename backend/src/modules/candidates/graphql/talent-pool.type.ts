import { Field, Int, ObjectType } from '@nestjs/graphql';
import { AchievedLevelMethodEnum } from '../../ai-evaluation/graphql/final-evaluation.type';
import { QuestionLevelEnum } from '../../question-bank/types/question.type';

/**
 * Past candidate of the company whose demonstrated (achieved) level matched or
 * exceeded the requested target level. One row per candidate email (best attempt).
 */
@ObjectType()
export class TalentPoolCandidateType {
  @Field()
  candidateId!: string;

  @Field()
  fullName!: string;

  @Field()
  email!: string;

  @Field(() => QuestionLevelEnum)
  achievedLevel!: QuestionLevelEnum;

  @Field(() => AchievedLevelMethodEnum, { nullable: true })
  achievedLevelMethod?: AchievedLevelMethodEnum | null;

  @Field()
  sourceInterviewId!: string;

  @Field()
  sourceInterviewTitle!: string;

  @Field()
  professionId!: string;

  @Field()
  professionName!: string;

  /**
   * Skills the pooled candidate's source interview shares with the requested
   * stack (or the full source stack when no `skillIds` were requested). For
   * highlighting only — skills never filter the pool, profession does.
   */
  @Field(() => [String])
  matchedSkills!: string[];

  @Field(() => Int)
  matchedSkillCount!: number;

  @Field(() => Int, { nullable: true })
  completedAt?: number | null;
}
