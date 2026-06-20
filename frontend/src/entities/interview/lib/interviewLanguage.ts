export const INTERVIEW_LANGUAGE_META = {
  ru: { flag: '🇷🇺', label: 'Русский' },
  en: { flag: '🇬🇧', label: 'English' },
} as const;

export type InterviewLanguageCode = keyof typeof INTERVIEW_LANGUAGE_META;

export const INTERVIEW_LANGUAGE_SELECT_OPTIONS = (
  Object.entries(INTERVIEW_LANGUAGE_META) as Array<
    [InterviewLanguageCode, (typeof INTERVIEW_LANGUAGE_META)[InterviewLanguageCode]]
  >
).map(([value, { flag, label }]) => ({
  value,
  label,
  flag,
}));

export function getInterviewLanguageLabel(code: string): string {
  const meta = INTERVIEW_LANGUAGE_META[code as InterviewLanguageCode];
  return meta ? `${meta.flag} ${meta.label}` : code;
}
