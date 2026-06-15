import {
  HallucinationGuardService,
  isEvidenceSupported,
} from './hallucination-guard.service';

describe('HallucinationGuardService', () => {
  const service = new HallucinationGuardService();

  it('flags evidence quotes that are not present in candidate answer', () => {
    const result = service.validateCheckpointResults(
      {
        interviewQuestionId: 1,
        interviewId: 1,
        attemptId: 1,
        companyId: 1,
        questionText: 'What is React?',
        idealAnswer: 'UI library',
        maxScore: 10,
        sourceQuestionId: 1,
        checkpoints: [
          {
            checkpointKey: 'react_definition',
            title: 'Defines React',
            expected: 'UI library',
            score: 10,
            sortOrder: 0,
          },
        ],
        candidateAnswer: 'React is a UI library.',
        candidateMessageId: 1,
        transcriptFragments: [],
      },
      [
        {
          checkpointKey: 'react_definition',
          status: 'met',
          confidence: 0.9,
          evidenceQuote: 'Vue is a framework',
          reasoningShort: 'Hallucinated quote.',
        },
      ],
    );

    expect(result.passed).toBe(false);
    expect(result.needsManualReview).toBe(true);
    expect(
      result.violations.some((item) => item.code === 'EVIDENCE_NOT_IN_ANSWER'),
    ).toBe(true);
  });

  it('accepts supported evidence via fuzzy word match', () => {
    expect(
      isEvidenceSupported(
        'React is a UI library for building components.',
        'UI library for building',
      ),
    ).toBe(true);
  });
});
