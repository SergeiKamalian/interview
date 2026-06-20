import type { InterviewEntity } from './entities/interview.entity';
import type { InterviewMessageEntity } from './entities/interview-message.entity';
import type { InterviewAttemptEntity } from './entities/interview-attempt.entity';
import {
  AttemptStatusEnum,
  InterviewStatusEnum,
  InterviewMessageKindEnum,
  type InterviewMessageType,
  type InterviewSessionType,
  type InterviewType,
  MessageRoleEnum,
  type PublicInterviewType,
  type StartPublicInterviewPayload,
  type SubmitInterviewAnswerPayload,
} from './types/interview.type';
import { QuestionLevelEnum } from '../question-bank/types/question.type';
import {
  AiToneEnum,
  ProbingDepthEnum,
  ScoringStrictnessEnum,
} from './types/interview-config.enum';

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
    interviewerName: interview.interviewerName,
    welcomeMessageTemplate: interview.welcomeMessageTemplate,
    aiTone: interview.aiTone as AiToneEnum,
    probingDepth: interview.probingDepth as ProbingDepthEnum,
    scoringStrictness: interview.scoringStrictness as ScoringStrictnessEnum,
    expiresAt: interview.expiresAt ? interview.expiresAt.toISOString() : null,
    maxCompletions: interview.maxCompletions,
    allowRetake: interview.allowRetake,
    timeLimitMinutes: interview.timeLimitMinutes,
    passingScore: interview.passingScore,
    requirePhone: interview.requirePhone,
    requireLinkedin: interview.requireLinkedin,
    requireGithub: interview.requireGithub,
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
    messageKind: message.messageKind as InterviewMessageKindEnum | null,
    interviewQuestionId: message.interviewQuestionId
      ? String(message.interviewQuestionId)
      : null,
    targetCheckpointKey: message.targetCheckpointKey,
  };
}

export function buildSessionPayload(input: {
  attempt: InterviewAttemptEntity;
  messages: InterviewMessageEntity[];
  totalQuestions: number;
  answeredQuestions: number;
  currentQuestionText: string | null;
  currentQuestionId: number | null;
  welcomeMessage?: string | null;
  isWelcomePending?: boolean;
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
    welcomeMessage: input.welcomeMessage ?? null,
    isWelcomePending: input.isWelcomePending ?? false,
  };
}

export function buildStartPayload(input: {
  attemptId: number;
  currentQuestionText: string | null;
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
  pendingMessageText?: string | null;
  messageKind?: InterviewMessageKindEnum | null;
  currentInterviewQuestionId?: number | null;
  isFollowUp?: boolean;
  answeredMainQuestions?: number;
  totalMainQuestions?: number;
  currentQuestionFollowUpCount?: number;
}): SubmitInterviewAnswerPayload {
  const pendingMessageText = input.pendingMessageText ?? input.nextQuestionText;
  const answeredMainQuestions =
    input.answeredMainQuestions ?? input.answeredQuestions;
  const totalMainQuestions = input.totalMainQuestions ?? input.totalQuestions;

  return {
    status: input.status as AttemptStatusEnum,
    nextQuestionText: input.nextQuestionText,
    answeredQuestions: answeredMainQuestions,
    totalQuestions: totalMainQuestions,
    pendingMessageText,
    messageKind: input.messageKind ?? null,
    currentInterviewQuestionId: input.currentInterviewQuestionId
      ? String(input.currentInterviewQuestionId)
      : null,
    isFollowUp: input.isFollowUp ?? false,
    answeredMainQuestions,
    totalMainQuestions,
    currentQuestionFollowUpCount: input.currentQuestionFollowUpCount ?? 0,
  };
}
