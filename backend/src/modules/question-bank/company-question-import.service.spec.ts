import { readFileSync } from 'fs';
import { join } from 'path';
import { NotFoundException } from '@nestjs/common';
import { CompanyQuestionImportService } from './company-question-import.service';
import type { QuestionBankRepository } from './question-bank.repository';

describe('CompanyQuestionImportService', () => {
  let service: CompanyQuestionImportService;
  let repository: jest.Mocked<
    Pick<
      QuestionBankRepository,
      | 'findProfessionByCode'
      | 'findSkillByCode'
      | 'findOwnedTopicByCode'
      | 'findOwnedQuestionByTopicAndText'
      | 'createCompanySkill'
      | 'createCompanyTopic'
      | 'updateCompanyTopic'
      | 'create'
      | 'update'
    >
  >;
  let redis: {
    setJson: jest.Mock;
    getJson: jest.Mock;
    del: jest.Mock;
  };
  let database: { withTransaction: jest.Mock };

  beforeEach(() => {
    repository = {
      findProfessionByCode: jest.fn(),
      findSkillByCode: jest.fn(),
      findOwnedTopicByCode: jest.fn(),
      findOwnedQuestionByTopicAndText: jest.fn(),
      createCompanySkill: jest.fn(),
      createCompanyTopic: jest.fn(),
      updateCompanyTopic: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    redis = {
      setJson: jest.fn().mockResolvedValue(undefined),
      getJson: jest.fn(),
      del: jest.fn().mockResolvedValue(undefined),
    };
    database = {
      withTransaction: jest.fn(async (fn) => fn(jest.fn())),
    };

    service = new CompanyQuestionImportService(
      repository as unknown as QuestionBankRepository,
      database as never,
      redis as never,
    );
  });

  it('preview returns counts and importToken for valid CSV', async () => {
    repository.findProfessionByCode.mockImplementation(async (code) =>
      code === 'frontend_developer' || code === 'backend_developer'
        ? { id: 1, code, name: code, isActive: true, createdAt: new Date(), updatedAt: new Date() }
        : null,
    );
    repository.findSkillByCode.mockResolvedValue({
      id: 10,
      companyId: null,
      code: 'react',
      name: 'React',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    repository.findOwnedTopicByCode.mockResolvedValue(null);
    repository.findOwnedQuestionByTopicAndText.mockResolvedValue(null);

    const buffer = readFileSync(
      join(__dirname, 'fixtures', 'sample-company-import.csv'),
    );
    const preview = await service.previewFromBuffer(7, buffer, 'sample.csv');

    expect(preview.errors).toEqual([]);
    expect(preview.importToken).toBeTruthy();
    expect(preview.toCreate.topics).toHaveLength(2);
    expect(preview.toCreate.questions).toHaveLength(2);
    expect(preview.toCreate.checkpoints).toBe(4);
    expect(redis.setJson).toHaveBeenCalled();
  });

  it('preview returns errors and no token when weights invalid', async () => {
    const csv = [
      'topic_code,topic_name,skill_code,interview_weight,profession_code,level,difficulty,question_text,short_answer,ideal_answer,checkpoint_key,checkpoint_title,checkpoint_expected,checkpoint_weight',
      'bad_weights,Bad Weights,react,5,frontend_developer,junior,basic,Какой минимальный набор знаний нужен junior React разработчику?,JSX props state hooks basics.,Junior знает JSX props state hooks component lifecycle basics.,only_one,Single checkpoint,Explains one concept only.,7',
    ].join('\n');

    const preview = await service.previewFromBuffer(
      7,
      Buffer.from(csv),
      'bad.csv',
    );

    expect(preview.importToken).toBeNull();
    expect(preview.errors.length).toBeGreaterThan(0);
    expect(redis.setJson).not.toHaveBeenCalled();
  });

  it('commit rejects missing import token', async () => {
    redis.getJson.mockResolvedValue(null);

    await expect(
      service.commit(7, { importToken: 'missing-token' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('commit upserts bundle in transaction', async () => {
    const buffer = readFileSync(
      join(__dirname, 'fixtures', 'sample-company-import.csv'),
    );
    repository.findProfessionByCode.mockImplementation(async (code) => ({
      id: code === 'frontend_developer' ? 1 : 2,
      code,
      name: code,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    repository.findSkillByCode.mockResolvedValue({
      id: 10,
      companyId: null,
      code: 'react',
      name: 'React',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    repository.findOwnedTopicByCode.mockResolvedValue(null);
    repository.findOwnedQuestionByTopicAndText.mockResolvedValue(null);
    repository.createCompanyTopic.mockImplementation(async (data) => ({
      id: data.code === 'acme_react_hooks' ? 100 : 101,
      companyId: data.companyId,
      skillId: data.skillId,
      code: data.code,
      name: data.name,
      interviewWeight: data.interviewWeight,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      skill: null,
    }));
    repository.create.mockResolvedValue({ id: 500 } as never);

    const preview = await service.previewFromBuffer(7, buffer, 'sample.csv');
    redis.getJson.mockImplementation(async (key: string) => {
      const [, companyId, token] = key.split(':');
      if (Number(companyId) === 7 && token === preview.importToken) {
        return (await redis.setJson.mock.calls[0]?.[1]) ?? null;
      }
      return null;
    });

    const storedEntry = redis.setJson.mock.calls[0]?.[1];
    redis.getJson.mockResolvedValue(storedEntry);

    const result = await service.commit(7, {
      importToken: preview.importToken!,
    });

    expect(result.topicsCreated).toBe(2);
    expect(result.questionsCreated).toBe(2);
    expect(database.withTransaction).toHaveBeenCalled();
    expect(redis.del).toHaveBeenCalled();
  });
});
