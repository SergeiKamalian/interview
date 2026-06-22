import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { CompanyQuestionOverrideRepository } from './company-question-override.repository';
import { QuestionBankRepository } from './question-bank.repository';
import { QuestionBankService } from './question-bank.service';

describe('QuestionBankService — company question overrides', () => {
  let service: QuestionBankService;
  let repository: jest.Mocked<
    Pick<QuestionBankRepository, 'findGlobalQuestionById'>
  >;
  let overrideRepository: jest.Mocked<
    Pick<
      CompanyQuestionOverrideRepository,
      'findByCompanyAndSourceQuestionId' | 'upsert' | 'delete'
    >
  >;

  const now = new Date();

  beforeEach(() => {
    repository = {
      findGlobalQuestionById: jest.fn(),
    };
    overrideRepository = {
      findByCompanyAndSourceQuestionId: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    };

    service = new QuestionBankService(
      repository as unknown as QuestionBankRepository,
      overrideRepository as unknown as CompanyQuestionOverrideRepository,
      {} as DatabaseService,
    );
  });

  it('upsertCompanyQuestionOverride rejects non-global source question', async () => {
    repository.findGlobalQuestionById.mockResolvedValue(null);

    await expect(
      service.upsertCompanyQuestionOverride(7, {
        sourceQuestionId: '999',
        extraMustConcepts: ['redux toolkit'],
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('upsertCompanyQuestionOverride stores tenant-scoped override', async () => {
    repository.findGlobalQuestionById.mockResolvedValue({
      id: 656,
      companyId: null,
    } as never);
    overrideRepository.upsert.mockResolvedValue({
      id: 1,
      companyId: 7,
      sourceQuestionId: 656,
      extraMustConcepts: ['redux toolkit'],
      extraFalseClaims: ['mobx default'],
      extraAnswerExamples: null,
      topicWeightOverride: null,
      createdAt: now,
      updatedAt: now,
    });

    const result = await service.upsertCompanyQuestionOverride(7, {
      sourceQuestionId: '656',
      extraMustConcepts: ['redux toolkit'],
      extraFalseClaims: ['mobx default'],
    });

    expect(overrideRepository.upsert).toHaveBeenCalledWith(
      7,
      expect.objectContaining({
        sourceQuestionId: 656,
        extraMustConcepts: ['redux toolkit'],
        extraFalseClaims: ['mobx default'],
      }),
    );
    expect(result.sourceQuestionId).toBe('656');
    expect(result.extraMustConcepts).toEqual(['redux toolkit']);
  });

  it('getCompanyQuestionOverride returns null when missing', async () => {
    overrideRepository.findByCompanyAndSourceQuestionId.mockResolvedValue(null);

    const result = await service.getCompanyQuestionOverride(7, '656');

    expect(result).toBeNull();
    expect(
      overrideRepository.findByCompanyAndSourceQuestionId,
    ).toHaveBeenCalledWith(7, 656);
  });

  it('deleteCompanyQuestionOverride throws when not found', async () => {
    overrideRepository.delete.mockResolvedValue(false);

    await expect(
      service.deleteCompanyQuestionOverride(7, '656'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects invalid source question id', async () => {
    await expect(
      service.upsertCompanyQuestionOverride(7, {
        sourceQuestionId: '0',
        extraMustConcepts: ['x'],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
