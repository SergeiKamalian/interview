import {
  resolveClassifierEmergencyFallback,
  isTargetedRefusalForPolicy,
} from './classifier-emergency-fallback.util';

describe('classifier-emergency-fallback.util', () => {
  const originalEnv = process.env.CLASSIFIER_REGEX_EMERGENCY_FALLBACK;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.CLASSIFIER_REGEX_EMERGENCY_FALLBACK;
    } else {
      process.env.CLASSIFIER_REGEX_EMERGENCY_FALLBACK = originalEnv;
    }
  });

  it('does not use regex when emergency flag is off', () => {
    delete process.env.CLASSIFIER_REGEX_EMERGENCY_FALLBACK;

    expect(
      isTargetedRefusalForPolicy({
        latestCandidateText: 'Давайте дальше',
      }),
    ).toBe(false);

    expect(
      resolveClassifierEmergencyFallback({
        messageKind: 'main_answer',
        mainQuestionText: 'Fiber?',
        candidateAnswer: 'Не знаю',
      }),
    ).toBeNull();
  });

  it('falls back to legacy regex when emergency flag is on', () => {
    process.env.CLASSIFIER_REGEX_EMERGENCY_FALLBACK = 'true';

    expect(
      isTargetedRefusalForPolicy({
        latestCandidateText: 'Давайте дальше',
      }),
    ).toBe(true);

    expect(
      resolveClassifierEmergencyFallback({
        messageKind: 'main_answer',
        mainQuestionText: 'Fiber?',
        candidateAnswer: 'Не знаю',
      }),
    ).toMatchObject({
      turnKind: 'decline_whole',
      disposition: 'declined',
      confidence: 'low',
    });
  });

  it('prefers classifier turn_kind over regex', () => {
    process.env.CLASSIFIER_REGEX_EMERGENCY_FALLBACK = 'true';

    expect(
      isTargetedRefusalForPolicy({
        candidateTurnKind: 'substantive_answer',
        latestCandidateText: 'Давайте дальше',
      }),
    ).toBe(false);

    expect(
      isTargetedRefusalForPolicy({
        candidateTurnKind: 'topic_refusal',
        latestCandidateText: 'substantive answer text',
      }),
    ).toBe(true);
  });
});
