import { Field, Int, ObjectType } from '@nestjs/graphql';
import { FinalEvaluationType } from './final-evaluation.type';

@ObjectType()
export class EvaluateInterviewAttemptPayload {
  @Field(() => Int)
  questionCount!: number;

  @Field(() => FinalEvaluationType)
  finalEvaluation!: FinalEvaluationType;
}
