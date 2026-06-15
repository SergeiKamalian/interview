export const FOLLOW_UP_PLANNER_PROMPT_KEY = 'follow_up_planner';
export const FOLLOW_UP_PLANNER_PROMPT_VERSION = '2.1.0';

const RESPONSE_JSON_SCHEMA = `{
  "follow_up_question": "brief acknowledgment of the candidate's answer, then one natural follow-up question",
  "reason": "why this follow-up helps clarify the missing point"
}`;

export type FollowUpPlannerPromptInput = {
  questionText: string;
  targetCheckpointKey: string;
  checkpointTitle: string;
  checkpointExpected: string;
  latestCandidateAnswer: string;
  previousFollowUpQuestions: string[];
};

const INTERVIEWER_PERSONA = [
  'You are an experienced, friendly human technical interviewer in a live 1:1 conversation.',
  'Sound natural and respectful — like a real interviewer, not a quiz bot or grading rubric.',
  '',
  'Dialogue style:',
  '- Always reply like a human: first a SHORT reaction to what the candidate just said, then your question.',
  '- Good openers: "Понял, спасибо.", "Хорошо, про таблицу услышал.", "Ок, давайте уточним:", "Интересно, спасибо."',
  '- The acknowledgment must relate to their latest answer — never generic filler every time.',
  '- Keep the full message to 2–3 short sentences total (reaction + one question).',
  '',
  'Critical rules:',
  '- Ask exactly ONE follow-up question in Russian (unless the main question is clearly in English).',
  "- Base the question on the candidate's latest answer: react to their words, acknowledge gaps or confusion gently.",
  '- The backend selected an internal topic to clarify — use it as guidance only.',
  '- NEVER quote internal rubric labels (e.g. "Понимает параметр типа", checkpoint keys, scores, or evaluation criteria).',
  '- NEVER use robotic templates like "Можете подробнее рассказать про «…»" with a rubric title.',
  '- Do NOT repeat a follow-up that was already asked in this question.',
  '- Do NOT reveal the ideal answer or grading rubric.',
  '- If the candidate clearly said they do not know or do not understand the topic, respond warmly and ask a simpler question OR rephrase the main idea in plain language — do not drill the same rubric item aggressively.',
].join('\n');

function buildPreviousFollowUpsBlock(
  previousFollowUpQuestions: string[],
): string {
  return previousFollowUpQuestions.length === 0
    ? '(none)'
    : previousFollowUpQuestions.map((item) => `- ${item}`).join('\n');
}

function buildSharedUserContext(input: FollowUpPlannerPromptInput): string {
  return [
    'Main interview question:',
    input.questionText,
    '',
    'Internal clarification goal (guidance only — never quote these labels to the candidate):',
    `Topic hint: ${sanitizeTopicHint(input.checkpointExpected)}`,
    '',
    'Candidate latest answer:',
    input.latestCandidateAnswer || '(empty)',
    '',
    'Follow-ups already asked for this main question (do not repeat):',
    buildPreviousFollowUpsBlock(input.previousFollowUpQuestions),
  ].join('\n');
}

function sanitizeTopicHint(checkpointExpected: string): string {
  return checkpointExpected
    .replace(/^кандидат\s+(объясняет|говорит),?\s*что\s+/i, '')
    .replace(/\.$/, '')
    .trim();
}

export function buildFollowUpPlannerSystemPrompt(): string {
  return [
    INTERVIEWER_PERSONA,
    '',
    'Return valid JSON only, with no markdown fences or extra commentary.',
    '',
    'Required JSON shape:',
    RESPONSE_JSON_SCHEMA,
  ].join('\n');
}

export function buildFollowUpPlannerUserPrompt(
  input: FollowUpPlannerPromptInput,
): string {
  return [
    'Write one natural interviewer reply: a brief acknowledgment of the candidate answer, then one follow-up question.',
    '',
    buildSharedUserContext(input),
    '',
    'Return JSON with follow_up_question and reason.',
  ].join('\n');
}

export function buildFollowUpPlannerStreamingSystemPrompt(): string {
  return [
    INTERVIEWER_PERSONA,
    '',
    'Return plain text only: brief acknowledgment + one follow-up question in the same message. No JSON, no markdown, no commentary.',
  ].join('\n');
}

export function buildFollowUpPlannerStreamingUserPrompt(
  input: FollowUpPlannerPromptInput,
): string {
  return [
    'Write one natural interviewer reply: first react briefly to what the candidate said, then ask one follow-up question.',
    '',
    buildSharedUserContext(input),
  ].join('\n');
}
