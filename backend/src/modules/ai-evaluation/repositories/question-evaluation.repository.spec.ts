import { QuestionEvaluationRepository } from './question-evaluation.repository';

describe('QuestionEvaluationRepository', () => {
  it('uses ON DUPLICATE KEY UPDATE for idempotent upsert SQL', async () => {
    const query = jest.fn((sql: string) => {
      if (sql.includes('WHERE interview_message_id')) {
        return Promise.resolve([
          {
            id: 11,
            company_id: 7,
            interview_attempt_id: 5,
            interview_message_id: 99,
            interview_question_id: 10,
            score: '7.50',
            max_score: '10.00',
            short_summary: '1/2 checkpoints met. Score 7.5/10.',
            review: '- Defines React: met',
            raw_response: '{"checkpoints":[]}',
            needs_manual_review: 0,
            created_at: new Date('2026-06-12T10:00:00.000Z'),
            updated_at: new Date('2026-06-12T10:00:00.000Z'),
          },
        ]);
      }

      return Promise.resolve({ insertId: 1, affectedRows: 1 });
    });

    const repository = new QuestionEvaluationRepository({
      query,
    } as never);

    const entity = await repository.upsertByInterviewMessage({
      companyId: 7,
      interviewAttemptId: 5,
      interviewMessageId: 99,
      interviewQuestionId: 10,
      score: 7.5,
      maxScore: 10,
      shortSummary: '1/2 checkpoints met. Score 7.5/10.',
      review: '- Defines React: met',
      rawResponse: { checkpoints: [] },
      needsManualReview: false,
    });

    expect(query).toHaveBeenCalledTimes(2);
    expect(String(query.mock.calls[0]?.[0])).toContain(
      'ON DUPLICATE KEY UPDATE',
    );
    expect(entity.id).toBe(11);
    expect(entity.interviewMessageId).toBe(99);
  });
});
