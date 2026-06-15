export function chunkTextForStream(text: string, chunkSize = 24): string[] {
  const trimmed = text.trim();
  if (!trimmed) {
    return [];
  }

  const chunks: string[] = [];
  let index = 0;

  while (index < trimmed.length) {
    chunks.push(trimmed.slice(index, index + chunkSize));
    index += chunkSize;
  }

  return chunks;
}
