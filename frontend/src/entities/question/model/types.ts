export type QuestionLevel = 'junior' | 'middle' | 'senior' | 'lead';

export type QuestionDifficulty = 'basic' | 'intermediate' | 'advanced';

export type AnswerExampleType = 'good' | 'bad';

export type QuestionStatus = 'draft' | 'published';

export type QuestionScope = 'all' | 'company' | 'global';

export type QuestionLookup = {
  id: string;
  code: string;
  name: string;
  interviewWeight?: number;
  isCustom?: boolean;
  skill?: QuestionLookup | null;
};

export type CheckpointEvaluationHints = {
  mustConcepts?: string[] | null;
  falseClaims?: string[] | null;
};

export type QuestionCheckpoint = {
  id: string;
  checkpointKey: string;
  title: string;
  expected: string;
  score: number;
  sortOrder: number;
  evaluationHints?: CheckpointEvaluationHints | null;
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
  isActive: boolean;
  isCustom: boolean;
  isRequired: boolean;
  companyPriority: number;
  status: QuestionStatus;
  sourceQuestionId?: string | null;
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
  isActive: boolean;
  isCustom: boolean;
  isRequired: boolean;
  companyPriority: number;
  status: QuestionStatus;
  maxScore: number;
  shortAnswer: string;
  idealAnswer: string;
  sourceQuestionId?: string | null;
  topic: QuestionLookup;
  profession: QuestionLookup;
  skills: QuestionLookup[];
  checkpoints: QuestionCheckpoint[];
  answerExamples: QuestionAnswerExample[];
};

export type QuestionBankListResult = {
  total: number;
  items: QuestionListItem[];
};
