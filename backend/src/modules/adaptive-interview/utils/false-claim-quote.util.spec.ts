import {
  extractMatchedFalseClaimQuote,
  extractMatchedFalseClaimQuoteStrict,
} from './false-claim-quote.util';

describe('extractMatchedFalseClaimQuoteStrict (TASK-17.5)', () => {
  const answer =
    'Замыкание — это функция вместе с лексическим окружением. ' +
    'Замыкание живёт только во время вызова и сразу удаляется из памяти.';

  it('returns the sentence that literally contains a configured false claim', () => {
    const quote = extractMatchedFalseClaimQuoteStrict(answer, [
      'сразу удаляется из памяти',
    ]);

    expect(quote).toBe(
      'Замыкание живёт только во время вызова и сразу удаляется из памяти.',
    );
  });

  it('returns null when no configured false claim matches (no first-sentence fallback)', () => {
    const quote = extractMatchedFalseClaimQuoteStrict(answer, [
      'замыкание это утечка памяти',
    ]);

    expect(quote).toBeNull();
  });

  it('returns null when there are no configured false claims', () => {
    expect(extractMatchedFalseClaimQuoteStrict(answer, [])).toBeNull();
    expect(extractMatchedFalseClaimQuoteStrict(answer, undefined)).toBeNull();
  });

  it('differs from the non-strict variant which falls back to the first sentence', () => {
    const strict = extractMatchedFalseClaimQuoteStrict(answer, [
      'замыкание это утечка памяти',
    ]);
    const lenient = extractMatchedFalseClaimQuote(answer, [
      'замыкание это утечка памяти',
    ]);

    expect(strict).toBeNull();
    // The lenient variant still returns the (irrelevant) opening sentence.
    expect(lenient).toBe(
      'Замыкание — это функция вместе с лексическим окружением.',
    );
  });
});
