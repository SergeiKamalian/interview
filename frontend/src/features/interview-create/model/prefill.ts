import type { QuestionLevel } from '@shared/api/graphql/generated/graphql';
import type { InterviewTemplate } from '@entities/interview-template/api/interviewTemplatesApi';
import type { WizardData } from './interviewWizard';

/**
 * Router-state contract for opening the creation wizard pre-filled from a quick
 * start (JD draft or template). The wizard stays fully editable — prefill only
 * seeds the initial state, nothing is persisted until the user creates.
 */
export interface InterviewWizardPrefillState {
  prefill?: Partial<WizardData>;
  /** Where the prefill came from (UI hint / analytics only). */
  prefillSource?: 'jd' | 'template';
}

const VALID_LEVELS: QuestionLevel[] = ['junior', 'middle', 'senior', 'lead'];

/** Narrows an arbitrary level-ish value to a wizard `QuestionLevel`. */
export function normalizeWizardLevel(
  level: string | null | undefined,
): QuestionLevel | undefined {
  if (level && (VALID_LEVELS as string[]).includes(level)) {
    return level as QuestionLevel;
  }
  return undefined;
}

/**
 * Maps a saved interview template to a wizard prefill. Every config field is
 * seeded so the user opens an editable wizard pre-populated from the template
 * (add/remove questions, tweak any setting) before the normal `createInterview`.
 */
export function buildWizardPrefillFromTemplate(
  template: InterviewTemplate,
): Partial<WizardData> {
  const questionIds = [...template.questions]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((question) => question.questionId);

  return {
    title: template.title,
    jobRole: template.jobRole,
    level: normalizeWizardLevel(template.level) ?? 'middle',
    interviewLanguage: template.interviewLanguage || 'ru',
    jobDescription: template.jobDescription ?? '',
    professionId: template.professionId ?? '',
    questionIds,
    aiTone: template.aiTone,
    probingDepth: template.probingDepth,
    scoringStrictness: template.scoringStrictness,
    interviewerName: template.interviewerName ?? '',
    welcomeMessageTemplate: template.welcomeMessageTemplate ?? '',
    mode: template.isVideoEnabled ? 'video' : 'text',
    timeLimitMinutes: template.timeLimitMinutes ?? null,
    maxCompletions: template.maxCompletions ?? null,
    allowRetake: template.allowRetake,
    requirePhone: template.requirePhone,
    requireLinkedin: template.requireLinkedin,
    requireGithub: template.requireGithub,
    passingScore: template.passingScore ?? null,
  };
}
