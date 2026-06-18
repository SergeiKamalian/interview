import type {
  ItleadImportStatus,
  ItleadImportWorklist,
  ItleadImportWorklistEntry,
  ItleadQuestionApiResponse,
  ItleadQuestionsGridResponse,
} from './itlead-api.types';

const ITLEAD_API_BASE = 'https://api.itlead.org/api/questions';
const ITLEAD_GRID_API = `${ITLEAD_API_BASE}/grid`;

export type ItleadLevelMapping = {
  level: 'junior' | 'middle' | 'senior' | 'lead';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  interviewWeight: number;
};

export function extractSlugFromItleadUrl(url: string): string {
  const parsed = new URL(url);
  const match = parsed.pathname.match(/\/interview-questions\/[^/]+\/([^/]+)\/?$/);

  if (!match?.[1]) {
    throw new Error(`Cannot extract question slug from ITLead URL: ${url}`);
  }

  return match[1];
}

export function buildItleadApiUrl(slug: string): string {
  return `${ITLEAD_API_BASE}/${slug}`;
}

export function buildItleadPageUrl(slug: string, categorySlug = 'react'): string {
  return `https://itlead.org/interview-questions/${categorySlug}/${slug}`;
}

export function slugToTopicCode(slug: string): string {
  return slug
    .replace(/-(and|or|the|in|of|to|for|with)-/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/-/g, '_');
}

export function suggestedBankFile(slug: string): string {
  return `topics/${slug}.bank.json`;
}

export async function fetchItleadQuestionsGrid(): Promise<ItleadQuestionsGridResponse> {
  const response = await fetch(ITLEAD_GRID_API);

  if (!response.ok) {
    throw new Error(`ITLead grid API ${response.status}: ${ITLEAD_GRID_API}`);
  }

  return (await response.json()) as ItleadQuestionsGridResponse;
}

export function buildWorklistFromGrid(
  grid: ItleadQuestionsGridResponse,
  statusBySlug: Map<string, { status: ItleadImportStatus; bankFile?: string; note?: string }>,
): ItleadImportWorklist {
  const questions: ItleadImportWorklistEntry[] = [];

  for (const category of grid.categories) {
    for (const question of category.questions) {
      const override = statusBySlug.get(question.slug);
      const importStatus = override?.status ?? 'todo';
      const bankFile = override?.bankFile ?? suggestedBankFile(question.slug);

      questions.push({
        categorySlug: category.slug,
        categoryName: category.nameEn,
        slug: question.slug,
        titleEn: question.titleEn,
        difficulty: question.difficulty,
        pageUrl: buildItleadPageUrl(question.slug, category.slug),
        detailApiUrl: buildItleadApiUrl(question.slug),
        suggestedTopicCode: slugToTopicCode(question.slug),
        suggestedBankFile: bankFile,
        importStatus,
        designDoc: `docs/question-bank/topics/${question.slug}.md`,
        note: override?.note ?? null,
      });
    }
  }

  questions.sort((a, b) => {
    const categoryOrder = a.categorySlug.localeCompare(b.categorySlug);
    if (categoryOrder !== 0) {
      return categoryOrder;
    }

    return a.slug.localeCompare(b.slug);
  });

  const byStatus = questions.reduce(
    (acc, entry) => {
      acc[entry.importStatus] = (acc[entry.importStatus] ?? 0) + 1;
      return acc;
    },
    {} as Record<ItleadImportStatus, number>,
  );

  return {
    syncedAt: new Date().toISOString(),
    gridApiUrl: ITLEAD_GRID_API,
    totalQuestions: questions.length,
    byStatus,
    questions,
  };
}

export async function fetchItleadQuestion(
  slugOrUrl: string,
): Promise<ItleadQuestionApiResponse> {
  const slug = slugOrUrl.startsWith('http')
    ? extractSlugFromItleadUrl(slugOrUrl)
    : slugOrUrl;

  const response = await fetch(buildItleadApiUrl(slug));

  if (!response.ok) {
    throw new Error(
      `ITLead API ${response.status} for slug "${slug}": ${buildItleadApiUrl(slug)}`,
    );
  }

  return (await response.json()) as ItleadQuestionApiResponse;
}

export function mapItleadDifficulty(
  difficulty: string,
): ItleadLevelMapping {
  switch (difficulty.trim().toUpperCase()) {
    case 'JUNIOR':
      return { level: 'junior', difficulty: 'basic', interviewWeight: 2 };
    case 'MIDDLE':
      return { level: 'middle', difficulty: 'intermediate', interviewWeight: 5 };
    case 'SENIOR':
      return { level: 'senior', difficulty: 'advanced', interviewWeight: 7 };
    case 'LEAD':
      return { level: 'lead', difficulty: 'advanced', interviewWeight: 9 };
    default:
      throw new Error(`Unknown ITLead difficulty: ${difficulty}`);
  }
}
