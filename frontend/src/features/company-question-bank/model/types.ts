import type {
  AnswerExampleType,
  QuestionDifficulty,
  QuestionLevel,
} from '@entities/question/model/types';

export type QuestionStatus = 'draft' | 'published';

export type CheckpointFormRow = {
  checkpointKey: string;
  title: string;
  expected: string;
  score: number;
  sortOrder: number;
  mustConcepts: string[];
  falseClaims: string[];
};

export type AnswerExampleFormRow = {
  exampleType: AnswerExampleType;
  exampleText: string;
  sortOrder: number;
};

export type QuestionEditorFormValues = {
  questionText: string;
  shortAnswer: string;
  idealAnswer: string;
  professionId: string;
  topicId: string;
  skillIds: string[];
  level: QuestionLevel;
  difficulty: QuestionDifficulty;
  status: QuestionStatus;
  companyPriority: number;
  isRequired: boolean;
  checkpoints: CheckpointFormRow[];
  answerExamples: AnswerExampleFormRow[];
};

export function createEmptyCheckpoint(sortOrder: number): CheckpointFormRow {
  return {
    checkpointKey: '',
    title: '',
    expected: '',
    score: sortOrder === 0 ? 10 : 0,
    sortOrder,
    mustConcepts: [],
    falseClaims: [],
  };
}

export function createDefaultQuestionEditorValues(): QuestionEditorFormValues {
  return {
    questionText: '',
    shortAnswer: '',
    idealAnswer: '',
    professionId: '',
    topicId: '',
    skillIds: [],
    level: 'middle',
    difficulty: 'intermediate',
    status: 'draft',
    companyPriority: 5,
    isRequired: false,
    checkpoints: [createEmptyCheckpoint(0)],
    answerExamples: [],
  };
}
