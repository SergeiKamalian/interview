import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CompanyQuestionPlaybookService } from './company-question-playbook.service';
import type { CompanyQuestionPlaybookRepository } from './company-question-playbook.repository';
import type { QuestionBankRepository } from './question-bank.repository';
import type { QuestionSuggestionService } from './question-suggestion.service';

describe('CompanyQuestionPlaybookService', () => {
  let service: CompanyQuestionPlaybookService;
  let playbookRepository: jest.Mocked<
    Pick<
      CompanyQuestionPlaybookRepository,
      | 'findByCompany'
      | 'findByIdForCompany'
      | 'findItemsByPlaybookId'
      | 'create'
      | 'update'
      | 'archive'
    >
  >;
  let questionBankRepository: jest.Mocked<
    Pick<QuestionBankRepository, 'findProfessionById' | 'findVisibleById'>
  >;
  let questionSuggestionService: jest.Mocked<
    Pick<QuestionSuggestionService, 'suggest'>
  >;

  beforeEach(() => {
    playbookRepository = {
      findByCompany: jest.fn(),
      findByIdForCompany: jest.fn(),
      findItemsByPlaybookId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      archive: jest.fn(),
    };
    questionBankRepository = {
      findProfessionById: jest.fn(),
      findVisibleById: jest.fn(),
    };
    questionSuggestionService = {
      suggest: jest.fn(),
    };

    service = new CompanyQuestionPlaybookService(
      playbookRepository as unknown as CompanyQuestionPlaybookRepository,
      questionBankRepository as unknown as QuestionBankRepository,
      questionSuggestionService as unknown as QuestionSuggestionService,
      { withTransaction: async (fn) => fn(jest.fn()) } as never,
    );
  });

  it('applyToInterviewDraft returns pinned first then fills via suggest', async () => {
    playbookRepository.findByIdForCompany.mockResolvedValue({
      id: 5,
      companyId: 1,
      name: 'Frontend Middle',
      professionId: 2,
      level: 'middle',
      skillIds: [10, 11],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    playbookRepository.findItemsByPlaybookId.mockResolvedValue([
      {
        id: 1,
        playbookId: 5,
        questionId: 100,
        sortOrder: 0,
        isPinned: true,
      },
      {
        id: 2,
        playbookId: 5,
        questionId: 101,
        sortOrder: 1,
        isPinned: true,
      },
      {
        id: 3,
        playbookId: 5,
        questionId: 102,
        sortOrder: 2,
        isPinned: false,
      },
    ]);
    questionBankRepository.findVisibleById.mockResolvedValue({
      id: 100,
      isActive: true,
      deletedAt: null,
    } as never);
    questionSuggestionService.suggest.mockResolvedValue({
      questionIds: ['201', '202'],
      questions: [],
      count: 2,
      candidateCount: 20,
      generatedByAi: true,
    });

    const result = await service.applyToInterviewDraft(1, '5', 5);

    expect(result.pinnedQuestionIds).toEqual(['100', '101']);
    expect(result.questionIds).toEqual(['100', '101', '102', '201', '202']);
    expect(questionSuggestionService.suggest).toHaveBeenCalledWith(1, {
      professionId: '2',
      level: 'middle',
      skillIds: ['10', '11'],
      count: 2,
      excludeQuestionIds: ['100', '101', '102'],
    });
  });

  it('create rejects invisible questions', async () => {
    questionBankRepository.findProfessionById.mockResolvedValue({
      id: 2,
      code: 'frontend',
      name: 'Frontend Developer',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    questionBankRepository.findVisibleById.mockResolvedValue(null);

    await expect(
      service.create(1, {
        name: 'Pack',
        professionId: '2',
        level: 'middle',
        items: [{ questionId: '999', sortOrder: 0, isPinned: true }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('getById throws when playbook missing for tenant', async () => {
    playbookRepository.findByIdForCompany.mockResolvedValue(null);

    await expect(service.getById(1, '42')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
