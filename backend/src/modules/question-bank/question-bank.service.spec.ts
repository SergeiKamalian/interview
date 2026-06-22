import {
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { QuestionBankRepository } from './question-bank.repository';
import { QuestionBankService } from './question-bank.service';

describe('QuestionBankService — company taxonomy', () => {
  let service: QuestionBankService;
  let repository: jest.Mocked<
    Pick<
      QuestionBankRepository,
      | 'createCompanyTopic'
      | 'createCompanySkill'
      | 'findOwnedSkillById'
      | 'findSkillRowById'
      | 'findSkillVisibleToCompany'
      | 'findOwnedTopicById'
      | 'findTopicRowById'
      | 'updateCompanySkill'
      | 'archiveCompanySkill'
    >
  >;

  beforeEach(() => {
    repository = {
      createCompanyTopic: jest.fn(),
      createCompanySkill: jest.fn(),
      findOwnedSkillById: jest.fn(),
      findSkillRowById: jest.fn(),
      findSkillVisibleToCompany: jest.fn(),
      findOwnedTopicById: jest.fn(),
      findTopicRowById: jest.fn(),
      updateCompanySkill: jest.fn(),
      archiveCompanySkill: jest.fn(),
    };

    service = new QuestionBankService(
      repository as unknown as QuestionBankRepository,
      { findByCompanyAndSourceQuestionId: jest.fn(), upsert: jest.fn(), delete: jest.fn(), findBySourceQuestionIds: jest.fn() } as never,
      {} as DatabaseService,
    );
  });

  it('createCompanyTopic validates snake_case code', async () => {
    await expect(
      service.createCompanyTopic(7, {
        code: 'Invalid-Code',
        name: 'Legacy Auth',
        skillId: '3',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('createCompanyTopic rejects duplicate code from database', async () => {
    repository.findSkillVisibleToCompany.mockResolvedValue({
      id: 3,
      companyId: null,
      code: 'nodejs',
      name: 'Node.js',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    repository.createCompanyTopic.mockRejectedValue({ code: 'ER_DUP_ENTRY' });

    await expect(
      service.createCompanyTopic(7, {
        code: 'legacy_auth',
        name: 'Legacy Auth',
        skillId: '3',
      }),
    ).rejects.toMatchObject({
      response: { code: 'DUPLICATE_TOPIC_CODE' },
    });
  });

  it('createCompanySkill creates company-owned skill', async () => {
    const now = new Date();
    repository.createCompanySkill.mockResolvedValue({
      id: 10,
      companyId: 7,
      code: 'internal_platform',
      name: 'Internal Platform',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const result = await service.createCompanySkill(7, {
      code: 'internal_platform',
      name: 'Internal Platform',
    });

    expect(result.isCustom).toBe(true);
    expect(result.code).toBe('internal_platform');
  });

  it('updateCompanySkill rejects global skill', async () => {
    repository.findOwnedSkillById.mockResolvedValue(null);
    repository.findSkillRowById.mockResolvedValue({
      id: 1,
      companyId: null,
      isActive: true,
    });

    await expect(
      service.updateCompanySkill(7, { id: '1', name: 'Renamed' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('archiveCompanyTopic rejects global topic', async () => {
    repository.findOwnedTopicById.mockResolvedValue(null);
    repository.findTopicRowById.mockResolvedValue({
      id: 5,
      companyId: null,
      isActive: true,
    });

    await expect(
      service.archiveCompanyTopic(7, '5'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
