import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { QuestionLevelEnum } from '../../question-bank/types/question.type';
import type { InterviewStatus } from './interview-status.enum';

export enum InterviewStatusEnum {
  draft = 'draft',
  active = 'active',
  archived = 'archived',
}

export enum AttemptStatusEnum {
  pending = 'pending',
  in_progress = 'in_progress',
  completed = 'completed',
  abandoned = 'abandoned',
}

export enum MessageRoleEnum {
  ai = 'ai',
  candidate = 'candidate',
}

registerEnumType(InterviewStatusEnum, { name: 'InterviewStatus' });
registerEnumType(AttemptStatusEnum, { name: 'AttemptStatus' });
registerEnumType(MessageRoleEnum, { name: 'MessageRole' });

@ObjectType()
export class InterviewType {
  @Field()
  id!: string;

  @Field()
  title!: string;

  @Field()
  jobRole!: string;

  @Field(() => QuestionLevelEnum)
  level!: QuestionLevelEnum;

  @Field()
  interviewLanguage!: string;

  @Field(() => Int)
  questionCount!: number;

  @Field(() => String, { nullable: true })
  jobDescription?: string | null;

  @Field()
  publicToken!: string;

  @Field()
  publicUrl!: string;

  @Field(() => InterviewStatusEnum)
  status!: InterviewStatusEnum;

  @Field()
  isVideoEnabled!: boolean;
}

@ObjectType()
export class InterviewMessageType {
  @Field()
  id!: string;

  @Field(() => MessageRoleEnum)
  role!: MessageRoleEnum;

  @Field()
  content!: string;

  @Field(() => Int)
  sequenceOrder!: number;
}

@ObjectType()
export class PublicInterviewType {
  @Field()
  title!: string;

  @Field()
  jobRole!: string;

  @Field(() => Int)
  questionCount!: number;

  @Field()
  interviewLanguage!: string;
}

@ObjectType()
export class InterviewSessionType {
  @Field()
  attemptId!: string;

  @Field(() => AttemptStatusEnum)
  status!: AttemptStatusEnum;

  @Field(() => Int)
  totalQuestions!: number;

  @Field(() => Int)
  answeredQuestions!: number;

  @Field(() => String, { nullable: true })
  currentQuestionText?: string | null;

  @Field(() => String, { nullable: true })
  currentQuestionId?: string | null;

  @Field(() => [InterviewMessageType])
  messages!: InterviewMessageType[];
}

@ObjectType()
export class StartPublicInterviewPayload {
  @Field()
  attemptId!: string;

  @Field()
  currentQuestionText!: string;

  @Field(() => Int)
  totalQuestions!: number;
}

@ObjectType()
export class SubmitInterviewAnswerPayload {
  @Field(() => AttemptStatusEnum)
  status!: AttemptStatusEnum;

  @Field(() => String, { nullable: true })
  nextQuestionText?: string | null;

  @Field(() => Int)
  answeredQuestions!: number;

  @Field(() => Int)
  totalQuestions!: number;
}

export const GRAPHQL_INTERVIEW_STATUSES: InterviewStatus[] = [
  'draft',
  'active',
  'archived',
];
