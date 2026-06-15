const DEFAULT_INPUT_PRICE_PER_1K = 0.00015;
const DEFAULT_OUTPUT_PRICE_PER_1K = 0.0006;

export function estimateAiCostUsd(input: {
  promptTokens: number;
  completionTokens: number;
  env?: NodeJS.ProcessEnv;
}): number {
  const env = input.env ?? process.env;
  const inputPrice = readPrice(
    env.AI_PRICE_INPUT_PER_1K,
    DEFAULT_INPUT_PRICE_PER_1K,
  );
  const outputPrice = readPrice(
    env.AI_PRICE_OUTPUT_PER_1K,
    DEFAULT_OUTPUT_PRICE_PER_1K,
  );

  const cost =
    (input.promptTokens / 1000) * inputPrice +
    (input.completionTokens / 1000) * outputPrice;

  return Math.round(cost * 1_000_000) / 1_000_000;
}

function readPrice(raw: string | undefined, fallback: number): number {
  if (!raw?.trim()) {
    return fallback;
  }

  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}
