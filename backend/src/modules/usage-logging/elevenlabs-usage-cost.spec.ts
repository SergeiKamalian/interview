import { estimateElevenLabsCostUsd } from './elevenlabs-usage-cost';

describe('estimateElevenLabsCostUsd', () => {
  it('estimates cost from character count', () => {
    const cost = estimateElevenLabsCostUsd({
      characterCount: 1000,
      env: { ELEVENLABS_PRICE_PER_1K_CHARS: '0.06' },
    });

    expect(cost).toBe(0.06);
  });
});
