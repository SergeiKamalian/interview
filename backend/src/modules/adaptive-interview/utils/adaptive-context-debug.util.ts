const PREVIEW_MAX_CHARS = 600;

export function previewTextFromCommon(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= PREVIEW_MAX_CHARS) {
    return trimmed;
  }

  return `${trimmed.slice(0, PREVIEW_MAX_CHARS)}…`;
}
