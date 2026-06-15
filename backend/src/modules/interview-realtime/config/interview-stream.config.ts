export function isAiMessageStreamingEnabled(): boolean {
  if (!readBooleanFlag(process.env.ADAPTIVE_INTERVIEW_ENABLED, false)) {
    return false;
  }

  return readBooleanFlag(process.env.ADAPTIVE_AI_MESSAGE_STREAMING, true);
}

function readBooleanFlag(
  value: string | undefined,
  fallback: boolean,
): boolean {
  if (value === undefined || value.trim() === '') {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
}
