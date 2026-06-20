import { useCallback, useMemo, useState } from 'react';
import type {
  AiTone,
  CreateInterviewInput,
  ProbingDepth,
  QuestionLevel,
  ScoringStrictness,
} from '@shared/api/graphql/generated/graphql';

export type InterviewMode = 'text' | 'voice' | 'video';

/**
 * Single source of truth for the creation wizard. Holds every editable field
 * across steps 1–7. `skillIds` is wizard-only (drives step 2 ordering/AI), it
 * is not persisted on the interview — questions carry their own skills.
 */
export interface WizardData {
  // Step 1 — vacancy & context
  title: string;
  jobRole: string;
  level: QuestionLevel;
  interviewLanguage: string;
  jobDescription: string;
  professionId: string;
  skillIds: string[];
  // Step 2 — questions (ordered)
  questionIds: string[];
  // Step 3 — AI behavior
  aiTone: AiTone;
  probingDepth: ProbingDepth;
  scoringStrictness: ScoringStrictness;
  interviewerName: string;
  welcomeMessageTemplate: string;
  // Step 4 — format & timing
  mode: InterviewMode;
  timeLimitMinutes: number | null;
  // Step 5 — access & limits
  expiresAt: string | null;
  maxCompletions: number | null;
  allowRetake: boolean;
  requirePhone: boolean;
  requireLinkedin: boolean;
  requireGithub: boolean;
  // Step 6 — results
  passingScore: number | null;
}

export const defaultWizardData: WizardData = {
  title: '',
  jobRole: '',
  level: 'middle',
  interviewLanguage: 'ru',
  jobDescription: '',
  professionId: '',
  skillIds: [],
  questionIds: [],
  aiTone: 'neutral',
  probingDepth: 'balanced',
  scoringStrictness: 'balanced',
  interviewerName: '',
  welcomeMessageTemplate: '',
  mode: 'text',
  timeLimitMinutes: null,
  expiresAt: null,
  maxCompletions: null,
  allowRetake: false,
  requirePhone: false,
  requireLinkedin: false,
  requireGithub: false,
  passingScore: null,
};

export type WizardStepId =
  | 'vacancy'
  | 'questions'
  | 'behavior'
  | 'format'
  | 'access'
  | 'results'
  | 'review';

export const WIZARD_STEPS: {
  id: WizardStepId;
  title: string;
  description: string;
}[] = [
  {
    id: 'vacancy',
    title: 'Вакансия',
    description: 'Роль, уровень, язык и релевантный стек.',
  },
  {
    id: 'questions',
    title: 'Вопросы',
    description: 'Соберите набор вопросов из банка по стекам.',
  },
  {
    id: 'behavior',
    title: 'Поведение AI',
    description: 'Тон, глубина уточнений и строгость оценки.',
  },
  {
    id: 'format',
    title: 'Формат',
    description: 'Режим прохождения и лимит времени.',
  },
  {
    id: 'access',
    title: 'Доступ',
    description: 'Дедлайн, лимиты и обязательные поля кандидата.',
  },
  {
    id: 'results',
    title: 'Результаты',
    description: 'Проходной балл и отбор кандидатов.',
  },
  {
    id: 'review',
    title: 'Публикация',
    description: 'Проверьте настройки и опубликуйте интервью.',
  },
];

export interface UseInterviewWizard {
  data: WizardData;
  update: (patch: Partial<WizardData>) => void;
  stepIndex: number;
  steps: typeof WIZARD_STEPS;
  goNext: () => void;
  goBack: () => void;
  goTo: (index: number) => void;
  isStepValid: (index: number) => boolean;
  canSubmit: boolean;
  buildCreateInput: () => CreateInterviewInput;
}

export function useInterviewWizard(
  initial?: Partial<WizardData>,
): UseInterviewWizard {
  const [data, setData] = useState<WizardData>({
    ...defaultWizardData,
    ...initial,
  });
  const [stepIndex, setStepIndex] = useState(0);

  const update = useCallback((patch: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const isStepValid = useCallback(
    (index: number) => {
      const step = WIZARD_STEPS[index];
      if (!step) {
        return true;
      }
      switch (step.id) {
        case 'vacancy':
          return data.title.trim().length > 0 && data.jobRole.trim().length > 0;
        case 'questions':
          return data.questionIds.length > 0;
        default:
          return true;
      }
    },
    [data],
  );

  const goTo = useCallback((index: number) => {
    setStepIndex(() => Math.max(0, Math.min(WIZARD_STEPS.length - 1, index)));
  }, []);

  const goNext = useCallback(() => {
    setStepIndex((prev) => Math.min(WIZARD_STEPS.length - 1, prev + 1));
  }, []);

  const goBack = useCallback(() => {
    setStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const canSubmit = useMemo(
    () =>
      data.title.trim().length > 0 &&
      data.jobRole.trim().length > 0 &&
      data.questionIds.length > 0,
    [data],
  );

  const buildCreateInput = useCallback((): CreateInterviewInput => {
    return {
      title: data.title.trim(),
      jobRole: data.jobRole.trim(),
      level: data.level,
      interviewLanguage: data.interviewLanguage || 'ru',
      jobDescription: data.jobDescription.trim() || undefined,
      professionId: data.professionId || undefined,
      isVideoEnabled: data.mode === 'video',
      interviewerName: data.interviewerName.trim() || undefined,
      welcomeMessageTemplate: data.welcomeMessageTemplate.trim() || undefined,
      aiTone: data.aiTone,
      probingDepth: data.probingDepth,
      scoringStrictness: data.scoringStrictness,
      expiresAt: data.expiresAt ?? undefined,
      maxCompletions: data.maxCompletions ?? undefined,
      allowRetake: data.allowRetake,
      timeLimitMinutes: data.timeLimitMinutes ?? undefined,
      passingScore: data.passingScore ?? undefined,
      requirePhone: data.requirePhone,
      requireLinkedin: data.requireLinkedin,
      requireGithub: data.requireGithub,
      questionCount: data.questionIds.length,
      questionIds: data.questionIds,
    };
  }, [data]);

  return {
    data,
    update,
    stepIndex,
    steps: WIZARD_STEPS,
    goNext,
    goBack,
    goTo,
    isStepValid,
    canSubmit,
    buildCreateInput,
  };
}
