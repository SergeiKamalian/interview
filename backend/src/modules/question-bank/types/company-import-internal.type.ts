import type { BankAnswerExample, BankCheckpoint, BankTopicFile } from '../../../seed/bank-topic.types';
import type { QuestionDifficulty } from './question-difficulty.enum';
import type { QuestionLevel } from './question-level.enum';
import type { QuestionStatus } from './question-status.enum';

export const COMPANY_IMPORT_COLUMNS = [
  'topic_code',
  'topic_name',
  'skill_code',
  'interview_weight',
  'profession_code',
  'level',
  'difficulty',
  'question_text',
  'short_answer',
  'ideal_answer',
  'checkpoint_key',
  'checkpoint_title',
  'checkpoint_expected',
  'checkpoint_weight',
  'must_concepts',
  'false_claims',
  'example_good',
  'example_bad',
] as const;

export type CompanyImportColumn = (typeof COMPANY_IMPORT_COLUMNS)[number];

export type CompanyImportFlatRow = Record<CompanyImportColumn, string> & {
  rowNumber: number;
};

export type CompanyImportTopicMeta = {
  code: string;
  name: string;
  skillCode: string;
  interviewWeight: number;
  isNewSkill?: boolean;
};

export type CompanyImportQuestionBundle = BankTopicFile & {
  importKey: string;
  topicCode: string;
  professionCode: string;
};

export type CompanyImportBundle = {
  topics: CompanyImportTopicMeta[];
  questions: CompanyImportQuestionBundle[];
};

export type CompanyImportFieldError = {
  row: number;
  field: string;
  message: string;
};

export type CompanyImportWarning = {
  row: number;
  message: string;
};

export type CompanyImportParseResult = {
  bundle: CompanyImportBundle | null;
  errors: CompanyImportFieldError[];
  warnings: CompanyImportWarning[];
};

export type CompanyImportPreviewCounts = {
  topics: number;
  skills: number;
  questions: number;
  checkpoints: number;
};

export type CompanyImportPreviewItem = {
  code?: string;
  name?: string;
  importKey?: string;
  topicCode?: string;
  questionText?: string;
  checkpointCount?: number;
};

export type CompanyImportPreviewDiff = {
  toCreate: {
    topics: CompanyImportPreviewItem[];
    skills: CompanyImportPreviewItem[];
    questions: CompanyImportPreviewItem[];
    checkpoints: number;
  };
  toUpdate: {
    topics: CompanyImportPreviewItem[];
    questions: CompanyImportPreviewItem[];
  };
};

export type CompanyImportCacheEntry = {
  companyId: number;
  bundle: CompanyImportBundle;
  diff: CompanyImportPreviewDiff;
  defaultStatus: QuestionStatus;
};

export type CompanyImportCommitResult = {
  topicsCreated: number;
  topicsUpdated: number;
  skillsCreated: number;
  questionsCreated: number;
  questionsUpdated: number;
};

export type ParsedImportQuestionMeta = {
  professionCode: string;
  level: QuestionLevel;
  difficulty: QuestionDifficulty;
  questionText: string;
  shortAnswer: string;
  idealAnswer: string;
};
