import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../../../common/database/database.service';
import { CheckpointStateRepository } from './checkpoint-state.repository';

describe('CheckpointStateRepository', () => {
  let repository: CheckpointStateRepository;
  let database: {
    query: jest.Mock;
  };

  beforeEach(async () => {
    database = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckpointStateRepository,
        {
          provide: DatabaseService,
          useValue: database,
        },
      ],
    }).compile();

    repository = module.get(CheckpointStateRepository);
  });

  it('uses INSERT ... ON DUPLICATE KEY UPDATE for idempotent ensure', async () => {
    database.query
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce([
        {
          id: 1,
          company_id: 7,
          interview_attempt_id: 5,
          interview_question_id: 10,
          checkpoint_key: 'side_effects',
          status: 'unseen',
          score_awarded: '0.00',
          max_score: '1.00',
          confidence: null,
          evidence_summary: null,
          evidence_message_ids: null,
          rationale: null,
          follow_up_count: 0,
          needs_manual_review: 0,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);

    const states = await repository.ensureForQuestion({
      companyId: 7,
      attemptId: 5,
      interviewQuestionId: 10,
      checkpoints: [
        { checkpointKey: 'side_effects', maxScore: 1 },
        { checkpointKey: 'cleanup', maxScore: 1 },
      ],
    });

    expect(database.query).toHaveBeenCalledTimes(3);
    expect(database.query.mock.calls[0]?.[0]).toContain('ON DUPLICATE KEY UPDATE id = id');
    expect(database.query.mock.calls[1]?.[0]).toContain('ON DUPLICATE KEY UPDATE id = id');
    expect(states).toHaveLength(1);
    expect(states[0]?.status).toBe('unseen');
    expect(states[0]?.scoreAwarded).toBe(0);
  });
});
