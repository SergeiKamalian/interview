const DEFAULT_ELEVENLABS_PRICE_PER_1K_CHARS = 0.06;

export function estimateElevenLabsCostUsd(input: {
  characterCount: number;
  env?: NodeJS.ProcessEnv;
}): number {
  const env = input.env ?? process.env;
  const pricePer1k = readPrice(
    env.ELEVENLABS_PRICE_PER_1K_CHARS,
    DEFAULT_ELEVENLABS_PRICE_PER_1K_CHARS,
  );

  const cost = (input.characterCount / 1000) * pricePer1k;
  return Math.round(cost * 1_000_000) / 1_000_000;
}

function readPrice(raw: string | undefined, fallback: number): number {
  if (!raw?.trim()) {
    return fallback;
  }

  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}
