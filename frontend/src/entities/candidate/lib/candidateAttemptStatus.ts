export type CandidateAttemptStatusInput = {
  status: string;
  reviewStatus: string;
  companyDecision: string;
  shortlistStatus: string;
  evaluationStatus: string;
};

function needsCompanyDecision(attempt: CandidateAttemptStatusInput): boolean {
  return (
    !attempt.companyDecision ||
    attempt.companyDecision === 'pending' ||
    attempt.companyDecision === 'none'
  );
}

function hasCompanyDecision(attempt: CandidateAttemptStatusInput): boolean {
  return (
    attempt.companyDecision === 'reject' ||
    attempt.companyDecision === 'invite_live' ||
    attempt.companyDecision === 'shortlist' ||
    attempt.companyDecision === 'hold'
  );
}

/** «Новый» — оценка готова, проверку ещё не открывали. */
export function isCandidateUnreadForReview(
  attempt: CandidateAttemptStatusInput,
): boolean {
  return (
    attempt.evaluationStatus === 'ready' &&
    needsCompanyDecision(attempt) &&
    (attempt.reviewStatus === 'pending' || !attempt.reviewStatus)
  );
}

/** Уже открывали проверку, решение ещё не принято. */
export function isCandidateOpenedForReview(
  attempt: CandidateAttemptStatusInput,
): boolean {
  return (
    attempt.evaluationStatus === 'ready' &&
    needsCompanyDecision(attempt) &&
    (attempt.reviewStatus === 'in_review' || attempt.reviewStatus === 'reviewed')
  );
}

export type CandidateRowTone = 'new' | 'viewed' | 'decided' | 'default';

export function getCandidateRowTone(
  attempt: CandidateAttemptStatusInput,
): CandidateRowTone {
  if (hasCompanyDecision(attempt)) {
    return 'decided';
  }

  if (isCandidateUnreadForReview(attempt)) {
    return 'new';
  }

  if (isCandidateOpenedForReview(attempt)) {
    return 'viewed';
  }

  return 'default';
}

export function getCandidateReviewProgressDetail(
  attempt: CandidateAttemptStatusInput,
): string | null {
  if (attempt.evaluationStatus !== 'ready' || !needsCompanyDecision(attempt)) {
    return null;
  }

  if (attempt.reviewStatus === 'pending' || !attempt.reviewStatus) {
    return 'Ещё не открывали';
  }

  if (attempt.reviewStatus === 'in_review') {
    return 'Проверка начата';
  }

  return 'Решение не принято';
}

export function getCandidatePrimaryStatus(attempt: CandidateAttemptStatusInput): {
  label: string;
  variant: 'success' | 'warning' | 'destructive' | 'muted' | 'info' | 'secondary' | 'outline' | 'default';
  hint: string;
  showBadge: boolean;
} {
  if (attempt.companyDecision === 'reject') {
    return {
      label: 'Отказ',
      variant: 'destructive',
      hint: 'Кандидата отклонили — дальше по отбору не идёт',
      showBadge: true,
    };
  }

  if (attempt.companyDecision === 'invite_live') {
    return {
      label: 'Одобрен',
      variant: 'success',
      hint: 'Кандидата одобрили — можно звать на следующий этап',
      showBadge: true,
    };
  }

  if (attempt.companyDecision === 'shortlist') {
    return {
      label: 'Следующий этап',
      variant: 'info',
      hint: 'Отмечен для продолжения отбора',
      showBadge: true,
    };
  }

  if (attempt.companyDecision === 'hold') {
    return {
      label: 'Отложено',
      variant: 'warning',
      hint: 'Финальное решение пока не принято',
      showBadge: true,
    };
  }

  if (attempt.status === 'in_progress') {
    return {
      label: 'Идёт интервью',
      variant: 'warning',
      hint: 'Кандидат сейчас проходит интервью',
      showBadge: true,
    };
  }

  if (attempt.status === 'pending') {
    return {
      label: 'Ожидает старта',
      variant: 'outline',
      hint: 'Кандидат ещё не начал интервью',
      showBadge: true,
    };
  }

  if (attempt.status === 'abandoned') {
    return {
      label: 'Прервано',
      variant: 'muted',
      hint: 'Интервью не было завершено кандидатом',
      showBadge: true,
    };
  }

  if (attempt.shortlistStatus === 'shortlisted') {
    return {
      label: 'Избранный',
      variant: 'secondary',
      hint: 'Сохранён в списке сильных кандидатов компании',
      showBadge: true,
    };
  }

  if (attempt.evaluationStatus === 'evaluation_pending') {
    return {
      label: 'Ожидает оценки',
      variant: 'warning',
      hint: 'Финальная ИИ-оценка ещё не готова',
      showBadge: true,
    };
  }

  if (attempt.evaluationStatus === 'ready' && needsCompanyDecision(attempt)) {
    if (isCandidateUnreadForReview(attempt)) {
      return {
        label: 'Новый',
        variant: 'default',
        hint: 'Новый результат — откройте проверку и примите решение',
        showBadge: true,
      };
    }

    if (isCandidateOpenedForReview(attempt)) {
      return {
        label: 'Не решено',
        variant: 'outline',
        hint: 'Проверка уже была — осталось принять решение',
        showBadge: true,
      };
    }
  }

  return {
    label: 'Завершено',
    variant: 'muted',
    hint: 'Интервью завершено, действий от команды не требуется',
    showBadge: false,
  };
}

export function getCandidateRowHighlightClass(
  attempt: CandidateAttemptStatusInput,
): string {
  const tone = getCandidateRowTone(attempt);

  if (tone === 'new') {
    return 'border-l-2 border-l-primary bg-primary/[0.04]';
  }

  if (tone === 'viewed') {
    return 'border-l-2 border-l-transparent bg-muted/35';
  }

  if (tone === 'decided') {
    return 'border-l-2 border-l-border';
  }

  return 'border-l-2 border-l-transparent';
}

export type CandidateTableStatusInput = CandidateAttemptStatusInput & {
  aiAssessmentVerdict?: string;
  needsManualReview?: boolean;
  hasTeamNotes?: boolean;
};

export function getCandidateTableStatus(attempt: CandidateTableStatusInput): {
  label: string;
  variant: 'success' | 'warning' | 'destructive' | 'muted' | 'info' | 'secondary' | 'outline' | 'default';
  hint: string;
  details: string[];
  showBadge: boolean;
  rowTone: CandidateRowTone;
  companyDecision: string;
} {
  const primary = getCandidatePrimaryStatus(attempt);
  const details: string[] = [];
  const rowTone = getCandidateRowTone(attempt);

  const reviewProgress = getCandidateReviewProgressDetail(attempt);
  if (reviewProgress && rowTone !== 'viewed') {
    details.push(reviewProgress);
  }

  if (rowTone === 'viewed') {
    details.push('Уже открывали — решение ещё не принято');
  }

  if (attempt.needsManualReview) {
    details.push('Нужна ручная проверка ответов');
  }

  if (attempt.aiAssessmentVerdict === 'disagree') {
    details.push('Команда не согласна с оценкой ИИ');
  } else if (attempt.aiAssessmentVerdict === 'agree') {
    details.push('Команда согласна с оценкой ИИ');
  }

  if (attempt.hasTeamNotes) {
    details.push('Есть заметки команды');
  }

  return {
    ...primary,
    details,
    rowTone,
    companyDecision: attempt.companyDecision,
  };
}
