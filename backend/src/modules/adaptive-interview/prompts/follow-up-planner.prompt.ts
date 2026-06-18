import { sanitizeCheckpointExpectedForCandidateSpeech } from '../utils/checkpoint-expected-speech.util';
import type { FollowUpAnswerTone } from '../utils/follow-up-acknowledgment.util';
import {
  INTERVIEWER_ACKNOWLEDGMENT_VARIETY_RULES,
  INTERVIEWER_FIRST_PERSON_VOICE_RULES,
  INTERVIEWER_FOLLOW_UP_REMINDER,
} from './interviewer-voice.prompt';

export const FOLLOW_UP_PLANNER_PROMPT_KEY = 'follow_up_planner';
export const FOLLOW_UP_PLANNER_PROMPT_VERSION = '2.8.0';

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
  followUpKind?: 'depth_probe' | 'residual_probe' | 'topic_redirect' | 'generic';
  missingMustConcepts?: string[];
  followUpBudgetBlock?: string;
  answeredCheckpointTitle?: string | null;
  answerTone?: FollowUpAnswerTone;
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
  '- Do NOT propose a second depth probe on checkpoints below minPriorityToProbe (see budget block).',
  '- If the candidate clearly said they do not know or do not understand the topic, respond warmly and ask a simpler question OR rephrase the main idea in plain language — do not drill the same rubric item aggressively.',
  '',
  'Answer-tone reactions (match how well they answered — do NOT always say «Вы верно описали общую идею»):',
  '- good: warm confirmation — «Да, в целом верно», «Хорошо, основную идею схватили», «Да, да — направление правильное»',
  '- partial: honest but friendly — «Ну, частично верно», «Есть верное, но не всё», «В целом ок, но давайте докопаемся»',
  '- weak: gentle correction allowed — «Ну, не совсем так» + ONE short sentence how it actually works (plain language, no rubric), then ask them to continue or clarify',
  '- NEVER reuse the same opener from prior follow-ups in this question — rotate or skip the opener.',
].join('\n');

function buildAnswerToneBlock(tone: FollowUpAnswerTone | undefined): string {
  if (!tone) {
    return '';
  }

  const guidance: Record<FollowUpAnswerTone, string> = {
    good: 'Candidate answer tone: good — they got the general idea; confirm briefly with varied positive opener, then ask about missing details.',
    partial:
      'Candidate answer tone: partial — some correct, some missing; acknowledge honestly («частично верно», «не всё»), then probe missing concepts.',
    weak: 'Candidate answer tone: weak — significant gaps or errors; you MAY briefly explain how it actually works (1 short sentence), then ask one clarifying question.',
  };

  return guidance[tone];
}

function buildDepthProbeBlock(
  missingMustConcepts: string[],
  answerTone: FollowUpAnswerTone | undefined,
): string {
  return [
    '',
    'Mandatory depth probe (not generic recap):',
    `Missing concepts to ask about: ${missingMustConcepts.join(', ')}`,
    buildAnswerToneBlock(answerTone),
    'Use a DIFFERENT short opener than prior follow-ups (or none). Then ask about 1–2 missing concepts in plain Russian.',
    'Do NOT start with «Хорошо. Вы верно описали общую идею» if that opener was already used above.',
  ]
    .filter((line) => line !== '')
    .join('\n');
}

function buildPreviousFollowUpsBlock(
  previousFollowUpQuestions: string[],
): string {
  return previousFollowUpQuestions.length === 0
    ? '(none)'
    : previousFollowUpQuestions.map((item) => `- ${item}`).join('\n');
}

function buildSharedUserContext(input: FollowUpPlannerPromptInput): string {
  const probeBlock =
    input.followUpKind === 'depth_probe' &&
    (input.missingMustConcepts?.length ?? 0) > 0
      ? buildDepthProbeBlock(
          input.missingMustConcepts!,
          input.answerTone,
        )
      : input.followUpKind === 'residual_probe' &&
          (input.missingMustConcepts?.length ?? 0) > 0
        ? [
            '',
            'Residual gap probe (candidate answered part of a compound follow-up):',
            `Still missing: ${input.missingMustConcepts!.join(', ')}`,
            buildAnswerToneBlock(input.answerTone),
            'Acknowledge what they got right with a VARIED opener (not the same as prior follow-ups), then ask ONLY about the missing part.',
          ].join('\n')
        : input.followUpKind === 'topic_redirect'
          ? [
              '',
              'Topic mismatch redirect:',
              input.answeredCheckpointTitle
                ? `The candidate answered about ${input.answeredCheckpointTitle}, but the question was about ${sanitizeTopicHint(input.checkpointExpected)}.`
                : `The candidate answered about a different topic than ${sanitizeTopicHint(input.checkpointExpected)}.`,
              'Write ONE polite redirect in Russian (interviewer «я» → candidate «вы»):',
              '- Briefly name the mismatch without quoting their full answer',
              '- Ask them to answer the original topic',
              '- Do NOT scold; sound like a helpful interviewer',
            ].join('\n')
          : '';

  return [
    'Main interview question:',
    input.questionText,
    '',
    'Internal clarification goal (guidance only — never quote these labels to the candidate):',
    `Topic hint: ${sanitizeTopicHint(input.checkpointExpected)}`,
    probeBlock,
    input.followUpBudgetBlock ? `\n${input.followUpBudgetBlock}` : '',
    '',
    'Candidate latest answer:',
    input.latestCandidateAnswer || '(empty)',
    '',
    'Follow-ups already asked for this main question (do not repeat topic OR opener phrasing):',
    buildPreviousFollowUpsBlock(input.previousFollowUpQuestions),
  ]
    .filter((line) => line !== '')
    .join('\n');
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
    'Write one natural interviewer reply: varied short opener (or none), then one follow-up question. Do not quote their answer. Do not reuse openers from prior follow-ups above.',
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
    'Return plain text only: varied short opener (or none) + one follow-up question in the same message. Never quote the candidate. No JSON, no markdown, no commentary.',
  ].join('\n');
}

export function buildFollowUpPlannerStreamingUserPrompt(
  input: FollowUpPlannerPromptInput,
): string {
  return [
    'Write one natural interviewer reply: varied short opener (or none), then one follow-up question. Do not quote their answer. Do not reuse openers from prior follow-ups above.',
    '',
    buildSharedUserContext(input),
    '',
    INTERVIEWER_FOLLOW_UP_REMINDER,
  ].join('\n');
}
