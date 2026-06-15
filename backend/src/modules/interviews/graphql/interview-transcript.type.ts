import { Field, Int, ObjectType } from '@nestjs/graphql';
import { MessageRoleEnum } from '../../interview-core/types/interview.type';

@ObjectType()
export class TranscriptSegmentType {
  @Field()
  messageId!: string;

  @Field(() => MessageRoleEnum)
  role!: MessageRoleEnum;

  @Field()
  content!: string;

  @Field(() => Int)
  sequenceOrder!: number;

  @Field(() => Int)
  timestamp!: number;

  @Field(() => String, { nullable: true })
  questionText?: string | null;

  @Field(() => String, { nullable: true })
  interviewQuestionId?: string | null;
}

@ObjectType()
export class InterviewTranscriptType {
  @Field()
  attemptId!: string;

  @Field(() => [TranscriptSegmentType])
  segments!: TranscriptSegmentType[];
}
