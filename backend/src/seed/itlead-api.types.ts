export type ItleadDifficulty = 'JUNIOR' | 'MIDDLE' | 'SENIOR' | string;

export type ItleadQuestionApiResponse = {
  id: string;
  slug: string;
  titleEn: string;
  titleUa?: string;
  descriptionEn?: string;
  contentMarkdownEn?: string;
  shortAnswerEn?: string;
  shortAnswerUa?: string;
  difficulty: ItleadDifficulty;
  isTop?: number;
  score?: number;
  category?: {
    slug: string;
    nameEn: string;
  };
};

export type ItleadBankMeta = {
  slug: string;
  apiUrl: string;
  pageUrl: string;
  difficulty: ItleadDifficulty;
  titleEn: string;
  categorySlug?: string;
  syncedAt?: string;
};

export type ItleadGridQuestion = {
  id: string;
  slug: string;
  titleEn: string;
  titleUa?: string;
  difficulty: ItleadDifficulty;
  isTop?: number;
  order?: number;
  bookmarksCount?: number;
};

export type ItleadGridCategory = {
  id: string;
  slug: string;
  nameEn: string;
  nameUa?: string;
  description?: string;
  icon?: string | null;
  color?: string | null;
  order?: number;
  questions: ItleadGridQuestion[];
};

export type ItleadQuestionsGridResponse = {
  categories: ItleadGridCategory[];
};

export type ItleadImportStatus =
  | 'todo'
  | 'draft'
  | 'ready'
  | 'seeded'
  | 'legacy-sql'
  | 'skip';

export type ItleadImportWorklistEntry = {
  categorySlug: string;
  categoryName: string;
  slug: string;
  titleEn: string;
  difficulty: ItleadDifficulty;
  pageUrl: string;
  detailApiUrl: string;
  suggestedTopicCode: string;
  suggestedBankFile: string;
  importStatus: ItleadImportStatus;
  designDoc?: string | null;
  note?: string | null;
};

export type ItleadImportWorklist = {
  syncedAt: string;
  gridApiUrl: string;
  totalQuestions: number;
  byStatus: Record<ItleadImportStatus, number>;
  questions: ItleadImportWorklistEntry[];
};
