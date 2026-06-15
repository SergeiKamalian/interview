import type { InterviewAttemptEntity } from '../../interview-core/entities/interview-attempt.entity';
import type { InterviewQuestionEntity } from '../../interview-core/entities/interview-question.entity';
import type { InterviewMessageKindEnum } from '../../interview-core/types/interview.type';

export type AdaptiveSubmitResult = {
  status: 'in_progress' | 'completed';
  nextQuestionText: string | null;
  pendingMessageText: string | null;
  messageKind: InterviewMessageKindEnum | null;
  currentInterviewQuestionId: number | null;
  isFollowUp: boolean;
  answeredMainQuestions: number;
  totalMainQuestions: number;
  currentQuestionFollowUpCount: number;
};

export type AdaptiveSubmitInput = {
  attempt: InterviewAttemptEntity;
  questions: InterviewQuestionEntity[];
  trimmedAnswer: string;
};
