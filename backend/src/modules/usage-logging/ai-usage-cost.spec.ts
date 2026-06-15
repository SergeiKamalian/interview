import { estimateAiCostUsd } from './ai-usage-cost';

describe('estimateAiCostUsd', () => {
  it('calculates cost from token usage and env prices', () => {
    const cost = estimateAiCostUsd({
      promptTokens: 1000,
      completionTokens: 500,
      env: {
        AI_PRICE_INPUT_PER_1K: '0.001',
        AI_PRICE_OUTPUT_PER_1K: '0.002',
      },
    });

    expect(cost).toBe(0.002);
  });
});
