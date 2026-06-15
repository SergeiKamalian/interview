export function formatUnixDate(timestamp?: number | null): string {
  if (!timestamp) {
    return '—';
  }

  return new Date(timestamp * 1000).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatScore(score?: number | null): string {
  if (score == null) {
    return '—';
  }

  return score.toFixed(1);
}

export function formatUsd(value: number): string {
  return value.toFixed(4);
}
