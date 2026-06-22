export type CompanyImportPreviewItem = {
  code?: string | null;
  name?: string | null;
  importKey?: string | null;
  topicCode?: string | null;
  questionText?: string | null;
  checkpointCount?: number | null;
};

export type CompanyImportPreviewCreate = {
  topics: CompanyImportPreviewItem[];
  skills: CompanyImportPreviewItem[];
  questions: CompanyImportPreviewItem[];
  checkpoints: number;
};

export type CompanyImportPreviewUpdate = {
  topics: CompanyImportPreviewItem[];
  questions: CompanyImportPreviewItem[];
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

export type CompanyQuestionImportPreview = {
  toCreate: CompanyImportPreviewCreate;
  toUpdate: CompanyImportPreviewUpdate;
  errors: CompanyImportFieldError[];
  warnings: CompanyImportWarning[];
  importToken?: string | null;
};

export type CompanyQuestionImportCommitResult = {
  topicsCreated: number;
  topicsUpdated: number;
  skillsCreated: number;
  questionsCreated: number;
  questionsUpdated: number;
};

export type ImportPreviewRow = {
  id: string;
  kind: 'create' | 'update';
  entity: 'topic' | 'skill' | 'question';
  code?: string | null;
  name?: string | null;
  details?: string | null;
};
