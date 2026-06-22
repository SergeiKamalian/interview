import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../../common/database/database.service';
import { CompanyQuestionOverrideRepository } from './company-question-override.repository';

describe('CompanyQuestionOverrideRepository', () => {
  let repository: CompanyQuestionOverrideRepository;
  let database: { query: jest.Mock };

  beforeEach(async () => {
    database = { query: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyQuestionOverrideRepository,
        { provide: DatabaseService, useValue: database },
      ],
    }).compile();

    repository = module.get(CompanyQuestionOverrideRepository);
  });

  it('findByCompanyAndSourceQuestionId scopes by company_id', async () => {
    const now = new Date();
    database.query.mockResolvedValueOnce([
      {
        id: 1,
        company_id: 7,
        source_question_id: 656,
        extra_must_concepts: JSON.stringify(['redux toolkit']),
        extra_false_claims: null,
        extra_answer_examples: null,
        topic_weight_override: null,
        created_at: now,
        updated_at: now,
      },
    ]);

    const override = await repository.findByCompanyAndSourceQuestionId(7, 656);

    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE company_id = ? AND source_question_id = ?'),
      [7, 656],
    );
    expect(override?.companyId).toBe(7);
    expect(override?.extraMustConcepts).toEqual(['redux toolkit']);
  });

  it('findBySourceQuestionIds returns map scoped to company', async () => {
    database.query.mockResolvedValueOnce([]);

    const result = await repository.findBySourceQuestionIds(7, [656, 657]);

    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE company_id = ? AND source_question_id IN'),
      [7, 656, 657],
    );
    expect(result.size).toBe(0);
  });

  it('upsert uses ON DUPLICATE KEY UPDATE for tenant row', async () => {
    const now = new Date();
    database.query
      .mockResolvedValueOnce({ insertId: 5 })
      .mockResolvedValueOnce([
        {
          id: 5,
          company_id: 7,
          source_question_id: 656,
          extra_must_concepts: JSON.stringify(['redux toolkit']),
          extra_false_claims: null,
          extra_answer_examples: null,
          topic_weight_override: '8.00',
          created_at: now,
          updated_at: now,
        },
      ]);

    const override = await repository.upsert(7, {
      sourceQuestionId: 656,
      extraMustConcepts: ['redux toolkit'],
      extraFalseClaims: null,
      extraAnswerExamples: null,
      topicWeightOverride: 8,
    });

    expect(database.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('ON DUPLICATE KEY UPDATE'),
      [
        7,
        656,
        JSON.stringify(['redux toolkit']),
        null,
        null,
        8,
      ],
    );
    expect(override.topicWeightOverride).toBe(8);
  });

  it('delete scopes by company_id and source_question_id', async () => {
    database.query.mockResolvedValueOnce({ affectedRows: 1 });

    const deleted = await repository.delete(7, 656);

    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(
        'DELETE FROM company_question_overrides\n       WHERE company_id = ? AND source_question_id = ?',
      ),
      [7, 656],
    );
    expect(deleted).toBe(true);
  });
});
