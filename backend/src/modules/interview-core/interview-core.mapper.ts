import type { InterviewEntity } from './entities/interview.entity';
import type { InterviewMessageEntity } from './entities/interview-message.entity';
import type { InterviewAttemptEntity } from './entities/interview-attempt.entity';
import {
  AttemptStatusEnum,
  InterviewStatusEnum,
  type InterviewMessageType,
  type InterviewSessionType,
  type InterviewType,
  MessageRoleEnum,
  type PublicInterviewType,
  type StartPublicInterviewPayload,
  type SubmitInterviewAnswerPayload,
} from './types/interview.type';
import { QuestionLevelEnum } from '../question-bank/types/question.type';

const DEFAULT_PUBLIC_BASE = '/i';

export function mapInterviewToGraphql(
  interview: InterviewEntity,
  publicBasePath = DEFAULT_PUBLIC_BASE,
): InterviewType {
  return {
    id: String(interview.id),
    title: interview.title,
    jobRole: interview.jobRole,
    level: interview.level as QuestionLevelEnum,
    interviewLanguage: interview.interviewLanguage,
    questionCount: interview.questionCount,
    jobDescription: interview.jobDescription,
    publicToken: interview.publicToken,
    publicUrl: `${publicBasePath}/${interview.publicToken}`,
    status: interview.status as InterviewStatusEnum,
    isVideoEnabled: interview.isVideoEnabled,
  };
}

export function mapPublicInterview(
  interview: InterviewEntity,
): PublicInterviewType {
  return {
    title: interview.title,
    jobRole: interview.jobRole,
    questionCount: interview.questionCount,
    interviewLanguage: interview.interviewLanguage,
  };
}

export function mapMessageToGraphql(
  message: InterviewMessageEntity,
): InterviewMessageType {
  return {
    id: String(message.id),
    role: message.role as MessageRoleEnum,
    content: message.content,
    sequenceOrder: message.sequenceOrder,
  };
}

export function buildSessionPayload(input: {
  attempt: InterviewAttemptEntity;
  messages: InterviewMessageEntity[];
  totalQuestions: number;
  answeredQuestions: number;
  currentQuestionText: string | null;
  currentQuestionId: number | null;
}): InterviewSessionType {
  return {
    attemptId: String(input.attempt.id),
    status: input.attempt.status as AttemptStatusEnum,
    totalQuestions: input.totalQuestions,
    answeredQuestions: input.answeredQuestions,
    currentQuestionText: input.currentQuestionText,
    currentQuestionId: input.currentQuestionId
      ? String(input.currentQuestionId)
      : null,
    messages: input.messages.map(mapMessageToGraphql),
  };
}

export function buildStartPayload(input: {
  attemptId: number;
  currentQuestionText: string;
  totalQuestions: number;
}): StartPublicInterviewPayload {
  return {
    attemptId: String(input.attemptId),
    currentQuestionText: input.currentQuestionText,
    totalQuestions: input.totalQuestions,
  };
}

export function buildSubmitPayload(input: {
  status: InterviewAttemptEntity['status'];
  nextQuestionText: string | null;
  answeredQuestions: number;
  totalQuestions: number;
}): SubmitInterviewAnswerPayload {
  return {
    status: input.status as AttemptStatusEnum,
    nextQuestionText: input.nextQuestionText,
    answeredQuestions: input.answeredQuestions,
    totalQuestions: input.totalQuestions,
  };
}
