import { Field, ObjectType } from '@nestjs/graphql';
import { QuestionLevelEnum, QuestionType } from './question.type';

/**
 * Prefill suggestion for the interview creation wizard, derived from a job
 * description. Everything here is a suggestion — the wizard stays fully
 * editable and nothing is persisted (no interview is created). The bank stays
 * the source of truth: profession/skills/questionIds reference existing rows.
 */
@ObjectType()
export class JobDescriptionDraftPayload {
  @Field(() => String, { nullable: true })
  title?: string | null;

  @Field(() => String, { nullable: true })
  jobRole?: string | null;

  @Field(() => String, { nullable: true })
  professionId?: string | null;

  @Field(() => QuestionLevelEnum, { nullable: true })
  level?: QuestionLevelEnum | null;

  /** Skill ids matched to the bank, constrained to the resolved profession. */
  @Field(() => [String])
  skillIds!: string[];

  /** Ordered question ids selected from the bank (first to ask -> last). */
  @Field(() => [String])
  questionIds!: string[];

  /** Full question objects, ordered to match `questionIds`. */
  @Field(() => [QuestionType])
  questions!: QuestionType[];

  /** True if the LLM classified the JD; false if it could not be resolved. */
  @Field()
  generatedByAi!: boolean;
}
