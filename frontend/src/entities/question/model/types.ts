export type QuestionLevel = 'junior' | 'middle' | 'senior' | 'lead';

export type QuestionDifficulty = 'basic' | 'intermediate' | 'advanced';

export type AnswerExampleType = 'good' | 'bad';

export type QuestionLookup = {
  id: string;
  code: string;
  name: string;
  interviewWeight?: number;
  skill?: QuestionLookup | null;
};

export type QuestionCheckpoint = {
  id: string;
  checkpointKey: string;
  title: string;
  expected: string;
  score: number;
  sortOrder: number;
};

export type QuestionAnswerExample = {
  id: string;
  exampleType: AnswerExampleType;
  exampleText: string;
  sortOrder: number;
};

export type QuestionListItem = {
  id: string;
  questionText: string;
  level: QuestionLevel;
  difficulty: QuestionDifficulty;
  maxScore: number;
  isActive: boolean;
  topic: QuestionLookup;
  profession: QuestionLookup;
  skills?: QuestionLookup[];
  checkpoints?: QuestionCheckpoint[];
  answerExamples?: QuestionAnswerExample[];
};

export type QuestionDetail = {
  id: string;
  questionText: string;
  level: QuestionLevel;
  difficulty: QuestionDifficulty;
  maxScore: number;
  isActive: boolean;
  shortAnswer: string;
  idealAnswer: string;
  topic: QuestionLookup;
  profession: QuestionLookup;
  checkpoints: QuestionCheckpoint[];
  answerExamples: QuestionAnswerExample[];
};

export type QuestionBankListResult = {
  total: number;
  items: QuestionListItem[];
};
