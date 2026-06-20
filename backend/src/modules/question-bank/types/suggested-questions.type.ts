import { Field, Int, ObjectType } from '@nestjs/graphql';
import { QuestionType } from './question.type';

@ObjectType()
export class SuggestedInterviewQuestionsPayload {
  /** Ordered question ids selected from the bank (first to ask -> last). */
  @Field(() => [String])
  questionIds!: string[];

  /** Full question objects, ordered to match `questionIds`. */
  @Field(() => [QuestionType])
  questions!: QuestionType[];

  @Field(() => Int)
  count!: number;

  /** Number of bank candidates considered before selection. */
  @Field(() => Int)
  candidateCount!: number;

  /** True if the LLM produced the selection; false if deterministic fallback. */
  @Field()
  generatedByAi!: boolean;
}
