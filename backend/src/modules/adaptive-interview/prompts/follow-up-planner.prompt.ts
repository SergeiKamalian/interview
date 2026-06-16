import { sanitizeCheckpointExpectedForCandidateSpeech } from '../utils/checkpoint-expected-speech.util';
import {
  INTERVIEWER_ACKNOWLEDGMENT_VARIETY_RULES,
  INTERVIEWER_FIRST_PERSON_VOICE_RULES,
  INTERVIEWER_FOLLOW_UP_REMINDER,
} from './interviewer-voice.prompt';

export const FOLLOW_UP_PLANNER_PROMPT_KEY = 'follow_up_planner';
export const FOLLOW_UP_PLANNER_PROMPT_VERSION = '2.5.0';

const RESPONSE_JSON_SCHEMA = `{
  "follow_up_question": "interviewer «я» → candidate «вы»: varied short opener (not «Понял, спасибо» every time) or none, then ONE direct follow-up question in Russian — never quote the candidate's words",
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
  INTERVIEWER_FIRST_PERSON_VOICE_RULES,
  '',
  'Dialogue style:',
  INTERVIEWER_ACKNOWLEDGMENT_VARIETY_RULES,
  '- Do NOT repeat, quote, or paraphrase what the candidate just said — no «про … услышал», no «…» with their answer.',
  '- They already know what they said; move straight to your clarifying question.',
  '- Keep the full message to 1–2 short sentences (optional acknowledgment + one question).',
  '',
  'Critical rules:',
  '- Ask exactly ONE follow-up question in Russian (unless the main question is clearly in English).',
  '- Use the candidate answer only to decide WHAT to ask next — never to recap it aloud.',
  '- The backend selected an internal topic to clarify — use it as guidance only; rephrase in «я»→«вы» form.',
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
    'Follow-ups already asked for this main question (do not repeat topic OR opener phrasing):',
    buildPreviousFollowUpsBlock(input.previousFollowUpQuestions),
  ].join('\n');
}

function sanitizeTopicHint(checkpointExpected: string): string {
  return sanitizeCheckpointExpectedForCandidateSpeech(checkpointExpected);
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
    'Write one natural interviewer reply: varied short opener (or none), then one follow-up question. Do not quote their answer. Do not reuse «Понял, спасибо» if it already appears above.',
    '',
    buildSharedUserContext(input),
    '',
    INTERVIEWER_FOLLOW_UP_REMINDER,
    '',
    'Return JSON with follow_up_question and reason.',
  ].join('\n');
}

export function buildFollowUpPlannerStreamingSystemPrompt(): string {
  return [
    INTERVIEWER_PERSONA,
    '',
    'Return plain text only: short generic acknowledgment + one follow-up question in the same message. Never quote the candidate. No JSON, no markdown, no commentary.',
  ].join('\n');
}

export function buildFollowUpPlannerStreamingUserPrompt(
  input: FollowUpPlannerPromptInput,
): string {
  return [
    'Write one natural interviewer reply: varied short opener (or none), then one follow-up question. Do not quote their answer. Do not reuse «Понял, спасибо» if it already appears above.',
    '',
    buildSharedUserContext(input),
    '',
    INTERVIEWER_FOLLOW_UP_REMINDER,
  ].join('\n');
}
