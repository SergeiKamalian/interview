import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { QuestionBankRepository } from './question-bank.repository';
import { QuestionBankService } from './question-bank.service';
import { QuestionStatusEnum } from './types/question.type';

describe('QuestionBankService — fork and company metadata', () => {
  let service: QuestionBankService;
  let repository: jest.Mocked<
    Pick<
      QuestionBankRepository,
      | 'findGlobalQuestionById'
      | 'forkQuestion'
      | 'findOwnedById'
      | 'update'
      | 'findProfessionById'
      | 'findTopicById'
      | 'findSkillsByIds'
    >
  >;
  let database: { withTransaction: jest.Mock };

  const now = new Date();

  const baseQuestion = {
    id: 9001,
    companyId: 7,
    sourceQuestionId: 55,
    status: 'draft' as const,
    companyPriority: 0,
    isRequired: false,
    professionId: 1,
    topicId: 10,
    level: 'middle' as const,
    difficulty: 'intermediate' as const,
    questionText: 'What is React?',
    shortAnswer: 'UI library',
    idealAnswer: 'React is a UI library',
    maxScore: 10,
    isActive: true,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    skillIds: [3],
    checkpoints: [],
    answerExamples: [],
  };

  beforeEach(() => {
    repository = {
      findGlobalQuestionById: jest.fn(),
      forkQuestion: jest.fn(),
      findOwnedById: jest.fn(),
      update: jest.fn(),
      findProfessionById: jest.fn(),
      findTopicById: jest.fn(),
      findSkillsByIds: jest.fn(),
    };
    database = {
      withTransaction: jest.fn(async (fn) => fn(jest.fn())),
    };

    service = new QuestionBankService(
      repository as unknown as QuestionBankRepository,
      { findByCompanyAndSourceQuestionId: jest.fn(), upsert: jest.fn(), delete: jest.fn(), findBySourceQuestionIds: jest.fn() } as never,
      database as unknown as DatabaseService,
    );

    repository.findProfessionById.mockResolvedValue({
      id: 1,
      code: 'frontend_developer',
      name: 'Frontend Developer',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    repository.findTopicById.mockResolvedValue({
      id: 10,
      companyId: null,
      skillId: 3,
      code: 'react_basics',
      name: 'React Basics',
      interviewWeight: 5,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      skill: null,
    });
    repository.findSkillsByIds.mockResolvedValue([
      {
        id: 3,
        companyId: null,
        code: 'react',
        name: 'React',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  });

  it('forkQuestion copies a global question into company draft', async () => {
    repository.findGlobalQuestionById.mockResolvedValue({
      ...baseQuestion,
      id: 55,
      companyId: null,
      sourceQuestionId: null,
      status: 'published',
    });
    repository.forkQuestion.mockResolvedValue(baseQuestion);

    const result = await service.forkQuestion(7, '55');

    expect(repository.forkQuestion).toHaveBeenCalledWith(7, 55, expect.any(Function));
    expect(result.sourceQuestionId).toBe('55');
    expect(result.status).toBe(QuestionStatusEnum.draft);
    expect(result.isCustom).toBe(true);
  });

  it('forkQuestion rejects missing global source', async () => {
    repository.findGlobalQuestionById.mockResolvedValue(null);

    await expect(service.forkQuestion(7, '55')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updateQuestion persists companyPriority and isRequired', async () => {
    repository.findOwnedById.mockResolvedValue(baseQuestion);
    repository.update.mockResolvedValue({
      ...baseQuestion,
      companyPriority: 8,
      isRequired: true,
      status: 'published',
    });

    const result = await service.update(7, {
      id: '9001',
      professionId: '1',
      topicId: '10',
      level: 'middle',
      difficulty: 'intermediate',
      questionText: 'What is React?',
      shortAnswer: 'UI library',
      idealAnswer: 'React is a UI library',
      maxScore: 10,
      skillIds: ['3'],
      checkpoints: [
        {
          checkpointKey: 'definition',
          title: 'Definition',
          expected: 'Defines React',
          score: 10,
          sortOrder: 0,
        },
      ],
      answerExamples: [],
      status: QuestionStatusEnum.published,
      companyPriority: 8,
      isRequired: true,
    });

    expect(result.companyPriority).toBe(8);
    expect(result.isRequired).toBe(true);
    expect(result.status).toBe(QuestionStatusEnum.published);
  });

  it('rejects invalid companyPriority above 10', async () => {
    await expect(
      service.update(7, {
        id: '9001',
        professionId: '1',
        topicId: '10',
        level: 'middle',
        difficulty: 'intermediate',
        questionText: 'What is React?',
        shortAnswer: 'UI library',
        idealAnswer: 'React is a UI library',
        maxScore: 10,
        skillIds: ['3'],
        checkpoints: [
          {
            checkpointKey: 'definition',
            title: 'Definition',
            expected: 'Defines React',
            score: 10,
            sortOrder: 0,
          },
        ],
        answerExamples: [],
        companyPriority: 11,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
