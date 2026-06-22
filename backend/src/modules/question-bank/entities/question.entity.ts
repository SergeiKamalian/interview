import type { QuestionDifficulty } from '../types/question-difficulty.enum';
import type { QuestionLevel } from '../types/question-level.enum';
import type { QuestionStatus } from '../types/question-status.enum';
import type { AnswerExampleEntity } from './answer-example.entity';
import type { QuestionCheckpointEntity } from './question-checkpoint.entity';

export type QuestionEntity = {
  id: number;
  companyId: number | null;
  sourceQuestionId: number | null;
  status: QuestionStatus;
  companyPriority: number;
  isRequired: boolean;
  professionId: number;
  topicId: number;
  level: QuestionLevel;
  difficulty: QuestionDifficulty;
  questionText: string;
  shortAnswer: string;
  idealAnswer: string;
  maxScore: number;
  isActive: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type QuestionWithDetailsEntity = QuestionEntity & {
  skillIds: number[];
  checkpoints: QuestionCheckpointEntity[];
  answerExamples: AnswerExampleEntity[];
};
