export const DEFAULT_INTERVIEWER_NAME = 'ваш AI-интервьюер';

export const DEFAULT_WELCOME_MESSAGE_TEMPLATE =
  'Привет, {{candidateName}}! Я {{interviewerName}}. Сегодня у нас интервью на позицию «{{jobRole}}». Готов начать?';

export type WelcomeMessageContext = {
  template: string | null | undefined;
  interviewerName: string | null | undefined;
  candidateName: string;
  jobRole: string;
  title: string;
  questionCount: number;
};

export function resolveWelcomeMessage(context: WelcomeMessageContext): string {
  const template =
    context.template?.trim() || DEFAULT_WELCOME_MESSAGE_TEMPLATE;
  const interviewerName =
    context.interviewerName?.trim() || DEFAULT_INTERVIEWER_NAME;
  const candidateName = context.candidateName.trim() || 'кандидат';
  const jobRole = context.jobRole.trim() || 'эту позицию';
  const title = context.title.trim() || jobRole;
  const titlePart =
    title && title !== jobRole ? ` — «${title}»` : '';

  return template
    .replaceAll('{{candidateName}}', candidateName)
    .replaceAll('{{interviewerName}}', interviewerName)
    .replaceAll('{{jobRole}}', jobRole)
    .replaceAll('{{title}}', title)
    .replaceAll('{{titlePart}}', titlePart)
    .replaceAll('{{questionCount}}', String(context.questionCount))
    .replace(/\s+/g, ' ')
    .trim();
}
