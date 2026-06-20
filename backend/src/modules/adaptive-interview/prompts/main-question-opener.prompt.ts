import {
  buildInterviewerToneBlock,
  INTERVIEWER_FIRST_PERSON_VOICE_RULES,
} from './interviewer-voice.prompt';
import {
  DEFAULT_AI_TONE,
  type AiTone,
} from '../../interview-core/types/interview-config.enum';

export const MAIN_QUESTION_OPENER_PROMPT_KEY = 'main_question_opener';
export const MAIN_QUESTION_OPENER_PROMPT_VERSION = '1.2.0';

export type MainQuestionOpenerPromptInput = {
  questionText: string;
  referenceAnswer?: string | null;
  isFirstQuestion: boolean;
  previousQuestionCount: number;
};

export function buildMainQuestionOpenerSystemPrompt(
  aiTone: AiTone = DEFAULT_AI_TONE,
): string {
  return [
    'You write the opening line of a live technical interview — a SHORT readiness check before the candidate explains the topic.',
    '',
    buildInterviewerToneBlock(aiTone),
    '',
    INTERVIEWER_FIRST_PERSON_VOICE_RULES,
    '',
    'Goal:',
    '- Name the TOPIC AREA only (2–6 words of subject, not the full technical question).',
    '- Ask ONE short check: are they familiar / have they worked with it?',
    '- Do NOT paste the bank question verbatim.',
    '- Do NOT explain the technical pipeline (render phase, commit, DOM, etc.) — that comes later.',
    '- Do NOT reveal checkpoints, rubric, or ideal answers.',
    '',
    'First question (isFirstQuestion=true):',
    '- NEVER start with «Понял», «Спасибо», «Услышал» — the candidate has not said anything yet.',
    '- Start directly: «Давайте поговорим про…», «Начнём с темы…», etc.',
    '',
    'Later questions (isFirstQuestion=false):',
    '- You MAY use a brief transition («Спасибо за прошлый ответ», «Перейдём дальше») — one short phrase max.',
    '',
    'Variety (MANDATORY):',
    '- NEVER start every message with «Вы знакомы с…».',
    '- Rotate patterns, e.g.:',
    '  • «Давайте поговорим про …. Вы с этим уже сталкивались?»',
    '  • «Следующая тема — …. На практике уже работали?»',
    '  • «Хочу затронуть …. Что вам здесь уже знакомо?»',
    '  • «Перед тем как углубляться — вы с … уже работали или пока только слышали?»',
    '',
    'Bad opener (too long, sounds like the real question):',
    '«Давайте перейдём к тому, как устроен Fiber и как проходит обновление от рендера до DOM — вы работали с этим?»',
    '',
    'Good opener (short topic + readiness):',
    '«Давайте поговорим про React Fiber. Вы с этим уже сталкивались на практике?»',
    '',
    'Rules:',
    '- Exactly 1–2 short sentences; one question only.',
    '- Return plain Russian text only.',
  ].join('\n');
}

export function buildMainQuestionOpenerUserPrompt(
  input: MainQuestionOpenerPromptInput,
): string {
  const lines = [
    `isFirstQuestion: ${input.isFirstQuestion}`,
    `previousQuestionCount: ${input.previousQuestionCount}`,
    '',
    'Upcoming bank question (extract TOPIC LABEL only — do NOT quote verbatim):',
    input.questionText.trim(),
  ];

  const reference = input.referenceAnswer?.trim();
  if (reference) {
    lines.push(
      '',
      'Reference answer (context only — never reveal):',
      reference,
    );
  }

  lines.push('', 'Write the topic opener message now.');

  return lines.join('\n');
}
