import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AiProviderService } from '../ai-provider/ai-provider.service';
import type { SuggestInterviewQuestionsInput } from './dto/suggest-interview-questions.input';
import {
  buildQuestionSuggestionSystemPrompt,
  buildQuestionSuggestionUserPrompt,
  QUESTION_SUGGESTION_PROMPT_KEY,
} from './prompts/question-suggestion.prompt';
import {
  QuestionBankRepository,
  type SuggestionCandidateEntity,
} from './question-bank.repository';
import { QuestionBankService } from './question-bank.service';
import type { SuggestedInterviewQuestionsPayload } from './types/suggested-questions.type';

const DEFAULT_COUNT = 10;
/** Fetch more candidates than requested so the LLM has room to choose. */
const CANDIDATE_MULTIPLIER = 8;
const MIN_CANDIDATE_POOL = 60;
const MAX_CANDIDATE_POOL = 300;

@Injectable()
export class QuestionSuggestionService {
  private readonly logger = new Logger(QuestionSuggestionService.name);

  constructor(
    private readonly repository: QuestionBankRepository,
    private readonly questionBankService: QuestionBankService,
    private readonly aiProviderService: AiProviderService,
  ) {}

  async suggest(
    companyId: number,
    input: SuggestInterviewQuestionsInput,
  ): Promise<SuggestedInterviewQuestionsPayload> {
    const professionId = Number(input.professionId);
    if (!Number.isInteger(professionId) || professionId <= 0) {
      throw new BadRequestException({
        message: 'Invalid professionId',
        code: 'INVALID_PROFESSION_ID',
      });
    }

    const profession = await this.repository.findProfessionById(professionId);
    if (!profession) {
      throw new BadRequestException({
        message: 'Profession not found',
        code: 'PROFESSION_NOT_FOUND',
      });
    }

    const count = input.count ?? DEFAULT_COUNT;
    const skillIds = (input.skillIds ?? [])
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);

    const poolLimit = Math.min(
      Math.max(count * CANDIDATE_MULTIPLIER, MIN_CANDIDATE_POOL),
      MAX_CANDIDATE_POOL,
    );

    const filterParams = {
      professionId,
      level: input.level,
      skillIds,
    };

    const excludeIdSet = new Set(
      (input.excludeQuestionIds ?? [])
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0),
    );

    const requiredCandidates = (
      await this.repository.findRequiredSuggestionCandidates(
        companyId,
        filterParams,
      )
    ).filter((candidate) => !excludeIdSet.has(candidate.id));
    const requiredIds = requiredCandidates.map((candidate) => candidate.id);
    const requiredIdSet = new Set(requiredIds);

    const candidates = (
      await this.repository.findSuggestionCandidates(companyId, {
        ...filterParams,
        limit: poolLimit,
      })
    ).filter((candidate) => !excludeIdSet.has(candidate.id));

    if (candidates.length === 0 && requiredIds.length === 0) {
      return {
        questionIds: [],
        questions: [],
        count: 0,
        candidateCount: 0,
        generatedByAi: false,
      };
    }

    const poolCandidates = candidates.filter(
      (candidate) => !requiredIdSet.has(candidate.id),
    );
    const candidateIds = new Set(poolCandidates.map((candidate) => candidate.id));
    const remainingCount = Math.max(0, count - requiredIds.length);

    const aiSelection =
      remainingCount > 0 && poolCandidates.length > 0
        ? await this.selectWithAi(
            companyId,
            professionId,
            input.level,
            skillIds,
            remainingCount,
            poolCandidates,
            candidateIds,
          )
        : [];

    const remainderIds =
      aiSelection.length > 0
        ? aiSelection
        : this.fallbackSelection(poolCandidates, remainingCount);

    const selectedIds = this.mergeSelection(requiredIds, remainderIds, count);

    const questions = await this.loadQuestions(companyId, selectedIds);

    return {
      questionIds: questions.map((question) => question.id),
      questions,
      count: questions.length,
      candidateCount: candidates.length,
      generatedByAi: aiSelection.length > 0,
    };
  }

  private async selectWithAi(
    companyId: number,
    professionId: number,
    level: SuggestInterviewQuestionsInput['level'],
    skillIds: number[],
    count: number,
    candidates: SuggestionCandidateEntity[],
    candidateIds: Set<number>,
  ): Promise<number[]> {
    try {
      const skillCodes =
        skillIds.length > 0
          ? (await this.repository.findSkillsByIds(companyId, skillIds)).map(
              (skill) => skill.code,
            )
          : [];
      const completion = await this.aiProviderService.evaluateJson(
        buildQuestionSuggestionSystemPrompt(),
        buildQuestionSuggestionUserPrompt({
          professionId,
          level,
          skillCodes,
          count,
          candidates,
        }),
        { operationType: QUESTION_SUGGESTION_PROMPT_KEY },
      );

      return this.parseAndGuardSelection(
        completion.content,
        candidateIds,
        count,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `AI question suggestion failed, using deterministic fallback: ${message}`,
      );
      return [];
    }
  }

  /**
   * Guard: keep only ids that exist in the candidate set (bank = source of
   * truth). Drops invented/duplicate ids and caps to the requested count.
   */
  private parseAndGuardSelection(
    rawContent: string,
    candidateIds: Set<number>,
    count: number,
  ): number[] {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      this.logger.warn('AI suggestion returned non-JSON content');
      return [];
    }

    const rawIds = this.extractIds(parsed);
    const seen = new Set<number>();
    const guarded: number[] = [];

    for (const rawId of rawIds) {
      const id = Number(rawId);
      if (!Number.isInteger(id) || !candidateIds.has(id) || seen.has(id)) {
        continue;
      }
      seen.add(id);
      guarded.push(id);
      if (guarded.length >= count) {
        break;
      }
    }

    return guarded;
  }

  private extractIds(parsed: unknown): unknown[] {
    if (Array.isArray(parsed)) {
      return parsed;
    }

    if (parsed && typeof parsed === 'object' && 'questionIds' in parsed) {
      const value = (parsed as Record<string, unknown>).questionIds;
      if (Array.isArray(value)) {
        return value;
      }
    }

    return [];
  }

  /**
   * Prepend pinned required ids, then append remainder without duplicates.
   */
  private mergeSelection(
    requiredIds: number[],
    remainderIds: number[],
    count: number,
  ): number[] {
    const seen = new Set<number>();
    const merged: number[] = [];

    for (const id of [...requiredIds, ...remainderIds]) {
      if (seen.has(id)) {
        continue;
      }
      seen.add(id);
      merged.push(id);
      if (merged.length >= count) {
        break;
      }
    }

    return merged;
  }

  /**
   * Deterministic, topic-diverse selection used when the LLM is unavailable.
   * Candidates arrive ordered by is_required, company boost, company_priority,
   * interview_weight DESC, id ASC.
   */
  private fallbackSelection(
    candidates: SuggestionCandidateEntity[],
    count: number,
  ): number[] {
    const selected: number[] = [];
    const usedTopics = new Set<number>();

    for (const candidate of candidates) {
      if (usedTopics.has(candidate.topicId)) {
        continue;
      }
      usedTopics.add(candidate.topicId);
      selected.push(candidate.id);
      if (selected.length >= count) {
        return selected;
      }
    }

    for (const candidate of candidates) {
      if (selected.includes(candidate.id)) {
        continue;
      }
      selected.push(candidate.id);
      if (selected.length >= count) {
        break;
      }
    }

    return selected;
  }

  private async loadQuestions(companyId: number, ids: number[]) {
    const questions = [];
    for (const id of ids) {
      questions.push(await this.questionBankService.getById(companyId, id));
    }
    return questions;
  }
}
