import { BadRequestException } from '@nestjs/common';
import { AiProviderService } from '../ai-provider/ai-provider.service';
import {
  QuestionBankRepository,
  type SuggestionCandidateEntity,
} from './question-bank.repository';
import { QuestionBankService } from './question-bank.service';
import { QuestionSuggestionService } from './question-suggestion.service';
import type { QuestionType } from './types/question.type';

type RepoMock = jest.Mocked<
  Pick<
    QuestionBankRepository,
    | 'findProfessionById'
    | 'findRequiredSuggestionCandidates'
    | 'findSuggestionCandidates'
    | 'findSkillsByIds'
  >
>;
type BankServiceMock = jest.Mocked<Pick<QuestionBankService, 'getById'>>;
type AiMock = jest.Mocked<Pick<AiProviderService, 'evaluateJson'>>;

const COMPANY_ID = 7;

function candidate(
  id: number,
  topicId: number,
  weight = 1,
  extras: Partial<
    Pick<
      SuggestionCandidateEntity,
      'isCustom' | 'companyPriority' | 'isRequired'
    >
  > = {},
): SuggestionCandidateEntity {
  return {
    id,
    questionText: `Question ${id}`,
    level: 'junior',
    difficulty: 'basic',
    maxScore: 5,
    topicId,
    topicName: `Topic ${topicId}`,
    interviewWeight: weight,
    skillCodes: ['react'],
    isCustom: extras.isCustom ?? false,
    companyPriority: extras.companyPriority ?? 0,
    isRequired: extras.isRequired ?? false,
  };
}

function stubQuestion(id: number): QuestionType {
  return { id: String(id) } as QuestionType;
}

describe('QuestionSuggestionService', () => {
  let service: QuestionSuggestionService;
  let repository: RepoMock;
  let questionBankService: BankServiceMock;
  let aiProviderService: AiMock;

  beforeEach(() => {
    repository = {
      findProfessionById: jest.fn(),
      findRequiredSuggestionCandidates: jest.fn(),
      findSuggestionCandidates: jest.fn(),
      findSkillsByIds: jest.fn(),
    };
    questionBankService = {
      getById: jest.fn((_companyId: number, id: number) =>
        Promise.resolve(stubQuestion(id)),
      ),
    };
    aiProviderService = {
      evaluateJson: jest.fn(),
    };

    service = new QuestionSuggestionService(
      repository as unknown as QuestionBankRepository,
      questionBankService as unknown as QuestionBankService,
      aiProviderService as unknown as AiProviderService,
    );

    repository.findProfessionById.mockResolvedValue({
      id: 1,
      code: 'frontend_developer',
      name: 'Frontend Developer',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    repository.findSkillsByIds.mockResolvedValue([]);
    repository.findRequiredSuggestionCandidates.mockResolvedValue([]);
  });

  it('drops AI ids that are not in the candidate set (bank = source of truth)', async () => {
    repository.findSuggestionCandidates.mockResolvedValue([
      candidate(101, 1),
      candidate(102, 2),
      candidate(103, 3),
    ]);
    aiProviderService.evaluateJson.mockResolvedValue({
      // 999 and "abc" are not real candidate ids -> must be dropped
      content: JSON.stringify({ questionIds: [999, '102', 'abc', '101'] }),
      model: 'test',
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      latencyMs: 1,
    });

    const result = await service.suggest(COMPANY_ID, {
      professionId: '1',
      count: 5,
    });

    expect(result.generatedByAi).toBe(true);
    expect(result.questionIds).toEqual(['102', '101']);
    expect(result.questionIds).not.toContain('999');
    expect(result.questionIds).not.toContain('abc');
  });

  it('caps the AI selection to the requested count and dedupes', async () => {
    repository.findSuggestionCandidates.mockResolvedValue([
      candidate(101, 1),
      candidate(102, 2),
      candidate(103, 3),
    ]);
    aiProviderService.evaluateJson.mockResolvedValue({
      content: JSON.stringify({ questionIds: ['101', '101', '102', '103'] }),
      model: 'test',
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      latencyMs: 1,
    });

    const result = await service.suggest(COMPANY_ID, {
      professionId: '1',
      count: 2,
    });

    expect(result.questionIds).toEqual(['101', '102']);
    expect(result.count).toBe(2);
  });

  it('returns a safe empty result when the bank has no candidates', async () => {
    repository.findSuggestionCandidates.mockResolvedValue([]);

    const result = await service.suggest(COMPANY_ID, {
      professionId: '1',
      count: 5,
    });

    expect(result).toEqual({
      questionIds: [],
      questions: [],
      count: 0,
      candidateCount: 0,
      generatedByAi: false,
    });
    expect(aiProviderService.evaluateJson).not.toHaveBeenCalled();
  });

  it('falls back to deterministic topic-diverse selection when AI fails', async () => {
    repository.findSuggestionCandidates.mockResolvedValue([
      candidate(101, 1, 3),
      candidate(102, 1, 3), // same topic -> skipped first pass
      candidate(103, 2, 2),
      candidate(104, 3, 1),
    ]);
    aiProviderService.evaluateJson.mockRejectedValue(new Error('AI down'));

    const result = await service.suggest(COMPANY_ID, {
      professionId: '1',
      count: 3,
    });

    expect(result.generatedByAi).toBe(false);
    // One per distinct topic, in candidate order (priority ordering)
    expect(result.questionIds).toEqual(['101', '103', '104']);
  });

  it('prefers company question over global at equal topic weight in fallback', async () => {
    // Repository ORDER BY puts custom boost before global at equal weight.
    repository.findSuggestionCandidates.mockResolvedValue([
      candidate(200, 1, 5, { isCustom: true, companyPriority: 8 }),
      candidate(100, 1, 5),
    ]);
    aiProviderService.evaluateJson.mockRejectedValue(new Error('AI down'));

    const result = await service.suggest(COMPANY_ID, {
      professionId: '1',
      count: 1,
    });

    expect(result.questionIds).toEqual(['200']);
  });

  it('always prepends required company questions when filters match', async () => {
    const required = candidate(50, 9, 5, {
      isCustom: true,
      isRequired: true,
      companyPriority: 10,
    });
    repository.findRequiredSuggestionCandidates.mockResolvedValue([required]);
    repository.findSuggestionCandidates.mockResolvedValue([
      required,
      candidate(101, 1, 3),
      candidate(102, 2, 2),
      candidate(103, 3, 1),
    ]);
    aiProviderService.evaluateJson.mockRejectedValue(new Error('AI down'));

    const result = await service.suggest(COMPANY_ID, {
      professionId: '1',
      count: 3,
    });

    expect(result.questionIds[0]).toBe('50');
    expect(result.questionIds).toHaveLength(3);
    expect(result.questionIds).toEqual(['50', '101', '102']);
  });

  it('reserves required slots and asks AI only for the remainder', async () => {
    repository.findRequiredSuggestionCandidates.mockResolvedValue([
      candidate(50, 9, 5, { isCustom: true, isRequired: true }),
    ]);
    repository.findSuggestionCandidates.mockResolvedValue([
      candidate(50, 9, 5, { isCustom: true, isRequired: true }),
      candidate(101, 1),
      candidate(102, 2),
    ]);
    aiProviderService.evaluateJson.mockResolvedValue({
      content: JSON.stringify({ questionIds: ['101'] }),
      model: 'test',
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      latencyMs: 1,
    });

    const result = await service.suggest(COMPANY_ID, {
      professionId: '1',
      count: 2,
    });

    expect(result.questionIds).toEqual(['50', '101']);
    expect(aiProviderService.evaluateJson).toHaveBeenCalledTimes(1);
    const userPrompt = aiProviderService.evaluateJson.mock.calls[0]?.[1] as string;
    expect(userPrompt).toContain('desired_question_count: 1');
    expect(userPrompt).not.toContain('id=50');
  });

  it('rejects an invalid professionId', async () => {
    repository.findProfessionById.mockResolvedValue(null);

    await expect(
      service.suggest(COMPANY_ID, { professionId: '99999', count: 3 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
