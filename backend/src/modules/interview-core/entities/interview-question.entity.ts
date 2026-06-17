import type { QuestionDifficulty } from '../../question-bank/types/question-difficulty.enum';
import type { QuestionLevel } from '../../question-bank/types/question-level.enum';
import type { InterviewQuestionCheckpointEntity } from './interview-question-checkpoint.entity';

export type InterviewQuestionEntity = {
  id: number;
  interviewId: number;
  sourceQuestionId: number | null;
  sortOrder: number;
  questionText: string;
  shortAnswer: string;
  idealAnswer: string;
  maxScore: number;
  level: QuestionLevel;
  difficulty: QuestionDifficulty;
  topicName: string | null;
  topicWeight: number;
  createdAt: Date;
};

export type InterviewQuestionWithCheckpointsEntity = InterviewQuestionEntity & {
  checkpoints: InterviewQuestionCheckpointEntity[];
};
