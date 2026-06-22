import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../../common/database/database.service';
import { QuestionBankRepository } from './question-bank.repository';

describe('QuestionBankRepository', () => {
  let repository: QuestionBankRepository;
  let database: { query: jest.Mock };

  beforeEach(async () => {
    database = { query: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionBankRepository,
        { provide: DatabaseService, useValue: database },
      ],
    }).compile();

    repository = module.get(QuestionBankRepository);
  });

  it('findSkillsByProfession without profession applies company visibility', async () => {
    database.query.mockResolvedValueOnce([
      {
        id: 1,
        company_id: null,
        code: 'react',
        name: 'React',
        is_active: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 99,
        company_id: 7,
        code: 'internal_platform',
        name: 'Internal Platform',
        is_active: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    const skills = await repository.findSkillsByProfession(7);

    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id IS NULL OR company_id = ?'),
      [7],
    );
    expect(skills).toHaveLength(2);
    expect(skills[1]?.companyId).toBe(7);
  });

  it('findTopics applies company visibility filter', async () => {
    database.query.mockResolvedValueOnce([]);

    await repository.findTopics(7);

    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining('t.company_id IS NULL OR t.company_id = ?'),
      [7],
    );
  });

  it('createCompanyTopic inserts with company_id and returns owned topic', async () => {
    const now = new Date();
    database.query
      .mockResolvedValueOnce({ insertId: 42 })
      .mockResolvedValueOnce([
        {
          id: 42,
          company_id: 7,
          skill_id: 3,
          code: 'legacy_auth',
          name: 'Legacy Auth',
          interview_weight: '5.00',
          is_active: 1,
          created_at: now,
          updated_at: now,
          skill_lookup_id: 3,
          skill_company_id: null,
          skill_code: 'nodejs',
          skill_name: 'Node.js',
          skill_is_active: 1,
          skill_created_at: now,
          skill_updated_at: now,
        },
      ]);

    const topic = await repository.createCompanyTopic({
      companyId: 7,
      code: 'legacy_auth',
      name: 'Legacy Auth',
      skillId: 3,
      interviewWeight: 5,
    });

    expect(database.query.mock.calls[0]?.[0]).toContain(
      'INSERT INTO topics (company_id, skill_id, code, name, interview_weight)',
    );
    expect(topic.id).toBe(42);
    expect(topic.companyId).toBe(7);
    expect(topic.code).toBe('legacy_auth');
  });

  it('createCompanySkill inserts with company_id', async () => {
    const now = new Date();
    database.query
      .mockResolvedValueOnce({ insertId: 10 })
      .mockResolvedValueOnce([
        {
          id: 10,
          company_id: 7,
          code: 'internal_platform',
          name: 'Internal Platform',
          is_active: 1,
          created_at: now,
          updated_at: now,
        },
      ]);

    const skill = await repository.createCompanySkill({
      companyId: 7,
      code: 'internal_platform',
      name: 'Internal Platform',
    });

    expect(database.query.mock.calls[0]?.[0]).toContain(
      'INSERT INTO skills (company_id, code, name)',
    );
    expect(skill.companyId).toBe(7);
  });

  it('archiveCompanyTopic soft-deletes only company-owned row', async () => {
    database.query.mockResolvedValueOnce({ affectedRows: 1 });

    const archived = await repository.archiveCompanyTopic(7, 42);

    expect(archived).toBe(true);
    expect(database.query.mock.calls[0]?.[0]).toContain('company_id = ?');
    expect(database.query.mock.calls[0]?.[1]).toEqual([42, 7]);
  });

  it('findSuggestionCandidates filters published questions only', async () => {
    database.query.mockResolvedValueOnce([]);

    await repository.findSuggestionCandidates(7, {
      professionId: 1,
      limit: 10,
    });

    const sql = database.query.mock.calls[0]?.[0] as string;
    expect(sql).toContain("q.status = 'published'");
    expect(sql).toContain('q.is_required DESC');
    expect(sql).toContain('q.company_priority DESC');
  });

  it('findRequiredSuggestionCandidates filters company required published rows', async () => {
    database.query.mockResolvedValueOnce([]);

    await repository.findRequiredSuggestionCandidates(7, {
      professionId: 1,
      level: 'middle',
    });

    const sql = database.query.mock.calls[0]?.[0] as string;
    expect(sql).toContain('q.company_id = ?');
    expect(sql).toContain('q.is_required = 1');
    expect(sql).toContain("q.status = 'published'");
    expect(sql).toContain('q.company_priority DESC');
  });

  it('list applies scope and status filters', async () => {
    database.query
      .mockResolvedValueOnce([{ total: 0 }])
      .mockResolvedValueOnce([]);

    await repository.list(7, {
      scope: 'company' as never,
      status: 'draft' as never,
    });

    const countSql = database.query.mock.calls[0]?.[0] as string;
    expect(countSql).toContain('q.company_id = ?');
    expect(countSql).toContain('q.status = ?');
    expect(database.query.mock.calls[0]?.[1]).toEqual([7, 7, 7, 'draft']);
  });

  it('forkQuestion copies global question into company draft', async () => {
    const now = new Date();

    database.query
      .mockResolvedValueOnce([
        {
          id: 55,
          company_id: null,
          source_question_id: null,
          status: 'published',
          company_priority: 0,
          is_required: 0,
          profession_id: 1,
          topic_id: 10,
          level: 'middle',
          difficulty: 'intermediate',
          question_text: 'What is React?',
          short_answer: 'UI library',
          ideal_answer: 'React is a UI library',
          max_score: '10.00',
          is_active: 1,
          deleted_at: null,
          created_at: now,
          updated_at: now,
        },
      ])
      .mockResolvedValueOnce([{ skill_id: 3 }])
      .mockResolvedValueOnce([
        {
          id: 1,
          question_id: 55,
          checkpoint_key: 'definition',
          title: 'Definition',
          expected: 'Defines React',
          evaluation_hints: null,
          score: '10.00',
          sort_order: 0,
          created_at: now,
          updated_at: now,
        },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({ insertId: 9001 })
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([
        {
          id: 9001,
          company_id: 7,
          source_question_id: 55,
          status: 'draft',
          company_priority: 0,
          is_required: 0,
          profession_id: 1,
          topic_id: 10,
          level: 'middle',
          difficulty: 'intermediate',
          question_text: 'What is React?',
          short_answer: 'UI library',
          ideal_answer: 'React is a UI library',
          max_score: '10.00',
          is_active: 1,
          deleted_at: null,
          created_at: now,
          updated_at: now,
        },
      ])
      .mockResolvedValueOnce([{ skill_id: 3 }])
      .mockResolvedValueOnce([
        {
          id: 2,
          question_id: 9001,
          checkpoint_key: 'definition',
          title: 'Definition',
          expected: 'Defines React',
          evaluation_hints: null,
          score: '10.00',
          sort_order: 0,
          created_at: now,
          updated_at: now,
        },
      ])
      .mockResolvedValueOnce([]);

    const forked = await repository.forkQuestion(7, 55);

    expect(database.query.mock.calls[4]?.[0]).toContain(
      "VALUES (?, ?, 'draft', 0, 0",
    );
    expect(forked.id).toBe(9001);
    expect(forked.companyId).toBe(7);
    expect(forked.sourceQuestionId).toBe(55);
    expect(forked.status).toBe('draft');
    expect(forked.checkpoints).toHaveLength(1);
  });

  it('findSuggestionCandidates excludes global rows replaced by published fork', async () => {
    database.query.mockResolvedValueOnce([]);

    await repository.findSuggestionCandidates(7, {
      professionId: 1,
      limit: 10,
    });

    const sql = database.query.mock.calls[0]?.[0] as string;
    expect(sql).toContain('fq.source_question_id = q.id');
    expect(sql).toContain("fq.status = 'published'");
  });

  it('question bank list excludes fork-replaced global unless includeForkReplacedGlobal', async () => {
    database.query
      .mockResolvedValueOnce([{ total: 0 }])
      .mockResolvedValueOnce([]);

    await repository.list(7, {
      limit: 20,
      offset: 0,
      includeForkReplacedGlobal: true,
    });

    const countSql = database.query.mock.calls[0]?.[0] as string;
    expect(countSql).not.toContain('fq.source_question_id = q.id');

    database.query.mockClear();
    database.query
      .mockResolvedValueOnce([{ total: 0 }])
      .mockResolvedValueOnce([]);

    await repository.list(7, { limit: 20, offset: 0 });

    const filteredSql = database.query.mock.calls[0]?.[0] as string;
    expect(filteredSql).toContain('fq.source_question_id = q.id');
  });
});
