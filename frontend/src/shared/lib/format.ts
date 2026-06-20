export function formatUnixDate(
  timestamp?: number | null,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!timestamp) {
    return '—';
  }

  return new Date(timestamp * 1000).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

export function formatScore(score?: number | null): string {
  if (score == null) {
    return '—';
  }

  return score.toFixed(1);
}

export function formatCompletionRate(rate?: number | null): string {
  if (rate == null) {
    return '—';
  }

  return `${rate.toLocaleString('ru-RU', {
    maximumFractionDigits: 1,
  })}%`;
}

export function formatUsd(value: number): string {
  return value.toFixed(4);
}
