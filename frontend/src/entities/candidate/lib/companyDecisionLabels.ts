/** Статус решения компании (прошедшее время / badge). */
export const COMPANY_DECISION_STATUS_LABELS: Record<string, string> = {
  pending: 'Решение не принято',
  none: '—',
  shortlist: 'Следующий этап',
  reject: 'Отказ',
  invite_live: 'Одобрен',
  hold: 'Отложено',
};

/** Глагол для audit log и действий (настоящее время). */
export const COMPANY_DECISION_ACTION_LABELS: Record<string, string> = {
  shortlist: 'отметить для следующего этапа',
  reject: 'отклонить',
  invite_live: 'одобрить',
  hold: 'отложить решение',
};

export function getCompanyDecisionLabel(value: string): string {
  return COMPANY_DECISION_STATUS_LABELS[value] ?? value;
}

export function getCompanyDecisionActionLabel(value: string): string {
  return COMPANY_DECISION_ACTION_LABELS[value] ?? value;
}

export function getShortlistStatusLabel(value: string): string {
  if (value === 'shortlisted') {
    return 'В списке избранных';
  }

  if (value === 'removed') {
    return 'Убран из избранных';
  }

  if (value === 'not_shortlisted') {
    return 'Не в избранных';
  }

  return '—';
}
