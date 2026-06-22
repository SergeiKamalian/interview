import { getCompanyDecisionActionLabel } from './companyDecisionLabels';

type DecisionAuditEvent = {
  source: string;
  action: string;
  previousValue?: string | null;
  newValue?: string | null;
};

const companyDecisionLabels: Record<string, string> = {
  shortlist: getCompanyDecisionActionLabel('shortlist'),
  reject: getCompanyDecisionActionLabel('reject'),
  invite_live: getCompanyDecisionActionLabel('invite_live'),
  hold: getCompanyDecisionActionLabel('hold'),
};

const aiVerdictLabels: Record<string, string> = {
  agree: 'согласие с оценкой ИИ',
  disagree: 'несогласие с оценкой ИИ',
};

export function formatDecisionAuditAction(event: DecisionAuditEvent): string {
  if (event.source === 'shortlist') {
    if (event.action === 'added') {
      return 'Добавлен в список избранных';
    }

    if (event.action === 'removed') {
      return 'Убран из списка избранных';
    }

    if (event.action === 'note_added') {
      return 'Добавлена заметка к избранному кандидату';
    }

    return `Избранные: ${event.action}`;
  }

  if (event.action === 'review_started') {
    return 'Начата проверка';
  }

  if (event.action === 'ai_verdict_set' && event.newValue) {
    return aiVerdictLabels[event.newValue] ?? `Оценка ИИ: ${event.newValue}`;
  }

  if (event.action === 'company_decision_set' && event.newValue) {
    const label = companyDecisionLabels[event.newValue] ?? event.newValue;
    return `Решение: ${label}`;
  }

  return event.action;
}

export function formatDecisionAuditActor(
  actorName?: string | null,
  actorEmail?: string | null,
): string {
  if (actorName?.trim()) {
    return actorName.trim();
  }

  if (actorEmail?.trim()) {
    return actorEmail.trim();
  }

  return 'Система';
}
