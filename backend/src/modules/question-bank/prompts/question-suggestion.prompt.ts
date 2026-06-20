import type { SuggestionCandidateEntity } from '../question-bank.repository';

export const QUESTION_SUGGESTION_PROMPT_KEY = 'question_suggestion';
export const QUESTION_SUGGESTION_PROMPT_VERSION = '1.0.0';

const RESPONSE_JSON_SCHEMA = `{
  "questionIds": ["<id from candidates>", "..."]
}`;

const MAX_QUESTION_TEXT_CHARS = 240;

export function buildQuestionSuggestionSystemPrompt(): string {
  return [
    'You build a technical interview by SELECTING questions from an existing question bank.',
    'You are NOT allowed to invent questions, ids, topics, or text.',
    'You ONLY pick ids from the provided candidate list.',
    '',
    'Goal: choose the optimal ordered set of questions for the target',
    'profession / level / skills, using these priorities:',
    '- relevance to the target level and (if given) the target skills;',
    '- topic diversity — avoid many questions from the same topic;',
    '- a sensible difficulty progression (easier first, harder later);',
    '- prefer topics with higher interview_weight when choosing between equals.',
    '',
    'Hard rules:',
    '- Return EXACTLY the requested number of ids when enough candidates exist;',
    '  if there are fewer candidates than requested, return all of them.',
    '- Every id MUST come from the candidate list. Never output an id not present there.',
    '- No duplicate ids.',
    '- Order ids from the first question to ask to the last.',
    '',
    'Return valid JSON only, no markdown fences:',
    RESPONSE_JSON_SCHEMA,
  ].join('\n');
}

export function buildQuestionSuggestionUserPrompt(params: {
  professionId: number;
  level?: string;
  skillCodes?: string[];
  count: number;
  candidates: SuggestionCandidateEntity[];
}): string {
  const lines = [
    'Target:',
    `- profession_id: ${params.professionId}`,
    `- level: ${params.level ?? 'any'}`,
    `- skills: ${
      params.skillCodes && params.skillCodes.length > 0
        ? params.skillCodes.join(', ')
        : 'any'
    }`,
    `- desired_question_count: ${params.count}`,
    '',
    `Candidates (${params.candidates.length}). Pick ids ONLY from this list:`,
  ];

  for (const candidate of params.candidates) {
    const text = candidate.questionText
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, MAX_QUESTION_TEXT_CHARS);
    const skills =
      candidate.skillCodes.length > 0 ? candidate.skillCodes.join('/') : '-';
    lines.push(
      `- id=${candidate.id} | topic="${candidate.topicName}" | level=${candidate.level} | difficulty=${candidate.difficulty} | maxScore=${candidate.maxScore} | weight=${candidate.interviewWeight} | skills=${skills} | text="${text}"`,
    );
  }

  lines.push(
    '',
    `Select up to ${params.count} ids and return JSON {"questionIds": [...]}.`,
  );

  return lines.join('\n');
}
