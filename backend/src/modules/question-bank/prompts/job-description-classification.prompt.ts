export const JD_CLASSIFICATION_PROMPT_KEY = 'jd_classification';
export const JD_CLASSIFICATION_PROMPT_VERSION = '1.0.0';

const RESPONSE_JSON_SCHEMA = `{
  "professionId": "<id from professions list, or null>",
  "level": "junior|middle|senior|lead|null",
  "skillIds": ["<id from skills list>", "..."],
  "title": "<short vacancy title, or null>",
  "jobRole": "<short role name, or null>"
}`;

const MAX_JD_CHARS = 6000;

export function buildJobDescriptionClassificationSystemPrompt(): string {
  return [
    'You classify a job description (JD) against an EXISTING catalog of',
    'professions and skills. You map the JD to real catalog entries only.',
    '',
    'Hard rules:',
    '- "professionId" MUST be an id from the provided professions list, or null',
    '  if none clearly matches. Pick the single best match.',
    '- Every id in "skillIds" MUST come from the provided skills list. Never',
    '  invent ids. Drop skills not present in the list. No duplicates.',
    '- "level" MUST be one of: junior, middle, senior, lead — or null if unclear.',
    '- "title" and "jobRole" are short free-text suggestions derived from the JD',
    '  (or null if the JD is empty/meaningless). Keep them concise.',
    '- If the input is not a real job description (gibberish, empty, unrelated),',
    '  return nulls and an empty skillIds array. Do NOT guess.',
    '',
    'Return valid JSON only, no markdown fences:',
    RESPONSE_JSON_SCHEMA,
  ].join('\n');
}

export function buildJobDescriptionClassificationUserPrompt(params: {
  jobDescription: string;
  language?: string;
  professions: { id: number; code: string; name: string }[];
  skills: { id: number; code: string; name: string }[];
}): string {
  const jd = params.jobDescription
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_JD_CHARS);

  const lines = [
    'Professions (pick professionId ONLY from this list):',
    ...params.professions.map(
      (profession) =>
        `- id=${profession.id} | code=${profession.code} | name="${profession.name}"`,
    ),
    '',
    'Skills (pick skillIds ONLY from this list):',
    ...params.skills.map(
      (skill) => `- id=${skill.id} | code=${skill.code} | name="${skill.name}"`,
    ),
    '',
    `Interview language hint: ${params.language ?? 'unspecified'}`,
    '',
    'Job description:',
    '"""',
    jd,
    '"""',
    '',
    'Classify the JD and return JSON matching the schema.',
  ];

  return lines.join('\n');
}
