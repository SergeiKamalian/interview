import { Injectable, Logger } from '@nestjs/common';
import { AiProviderService } from '../ai-provider/ai-provider.service';
import type { DraftInterviewFromJobDescriptionInput } from './dto/draft-interview-from-job-description.input';
import {
  buildJobDescriptionClassificationSystemPrompt,
  buildJobDescriptionClassificationUserPrompt,
  JD_CLASSIFICATION_PROMPT_KEY,
} from './prompts/job-description-classification.prompt';
import { QuestionBankRepository } from './question-bank.repository';
import { QuestionSuggestionService } from './question-suggestion.service';
import type { JobDescriptionDraftPayload } from './types/job-description-draft.type';
import { QuestionLevelEnum } from './types/question.type';
import { QUESTION_LEVELS } from './types/question-level.enum';

const MAX_TITLE_CHARS = 255;
const DEFAULT_COUNT = 10;

interface RawClassification {
  professionId?: unknown;
  level?: unknown;
  skillIds?: unknown;
  title?: unknown;
  jobRole?: unknown;
}

@Injectable()
export class JobDescriptionDraftService {
  private readonly logger = new Logger(JobDescriptionDraftService.name);

  constructor(
    private readonly repository: QuestionBankRepository,
    private readonly questionSuggestionService: QuestionSuggestionService,
    private readonly aiProviderService: AiProviderService,
  ) {}

  async draftFromJobDescription(
    companyId: number,
    input: DraftInterviewFromJobDescriptionInput,
  ): Promise<JobDescriptionDraftPayload> {
    const [professions, skills] = await Promise.all([
      this.repository.findProfessions(),
      this.repository.findSkillsByProfession(companyId),
    ]);

    const emptyDraft: JobDescriptionDraftPayload = {
      title: null,
      jobRole: null,
      professionId: null,
      level: null,
      skillIds: [],
      questionIds: [],
      questions: [],
      generatedByAi: false,
    };

    if (professions.length === 0) {
      return emptyDraft;
    }

    const professionIds = new Set(
      professions.map((profession) => profession.id),
    );
    const skillIds = new Set(skills.map((skill) => skill.id));

    const classification = await this.classify(input, professions, skills);
    if (!classification) {
      return emptyDraft;
    }

    const professionId = this.resolveProfessionId(
      classification.professionId,
      professionIds,
    );
    const level = this.resolveLevel(classification.level);
    const title = this.resolveText(classification.title);
    const jobRole = this.resolveText(classification.jobRole);
    const matchedSkillIds = this.resolveSkillIds(
      classification.skillIds,
      skillIds,
    );

    // Without a profession we cannot meaningfully select questions from the
    // bank, so return whatever partial signal we have (no questions).
    if (professionId === null) {
      return {
        ...emptyDraft,
        title,
        jobRole,
        level,
        skillIds: matchedSkillIds.map((id) => String(id)),
        generatedByAi: true,
      };
    }

    // Constrain skills to those actually relevant to the resolved profession
    // (derived from the bank), so the prefill stays consistent with step 1.
    const professionSkills = await this.repository.findSkillsByProfession(
      companyId,
      professionId,
    );
    const professionSkillIds = new Set(
      professionSkills.map((skill) => skill.id),
    );
    const finalSkillIds = matchedSkillIds.filter((id) =>
      professionSkillIds.has(id),
    );

    const suggestion = await this.questionSuggestionService.suggest(companyId, {
      professionId: String(professionId),
      level,
      skillIds: finalSkillIds.map((id) => String(id)),
      count: input.count ?? DEFAULT_COUNT,
    });

    return {
      title,
      jobRole,
      professionId: String(professionId),
      level,
      skillIds: finalSkillIds.map((id) => String(id)),
      questionIds: suggestion.questionIds,
      questions: suggestion.questions,
      generatedByAi: true,
    };
  }

  private async classify(
    input: DraftInterviewFromJobDescriptionInput,
    professions: { id: number; code: string; name: string }[],
    skills: { id: number; code: string; name: string }[],
  ): Promise<RawClassification | null> {
    try {
      const completion = await this.aiProviderService.evaluateJson(
        buildJobDescriptionClassificationSystemPrompt(),
        buildJobDescriptionClassificationUserPrompt({
          jobDescription: input.jobDescription,
          language: input.language,
          professions,
          skills,
        }),
        { operationType: JD_CLASSIFICATION_PROMPT_KEY },
      );

      const parsed: unknown = JSON.parse(completion.content);
      if (!parsed || typeof parsed !== 'object') {
        return null;
      }
      return parsed;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`JD classification failed: ${message}`);
      return null;
    }
  }

  private resolveProfessionId(
    raw: unknown,
    professionIds: Set<number>,
  ): number | null {
    const id = Number(raw);
    if (!Number.isInteger(id) || !professionIds.has(id)) {
      return null;
    }
    return id;
  }

  private resolveLevel(raw: unknown): QuestionLevelEnum | undefined {
    if (typeof raw !== 'string') {
      return undefined;
    }
    const value = raw.trim().toLowerCase();
    return (QUESTION_LEVELS as readonly string[]).includes(value)
      ? (value as QuestionLevelEnum)
      : undefined;
  }

  private resolveText(raw: unknown): string | null {
    if (typeof raw !== 'string') {
      return null;
    }
    const value = raw.trim().slice(0, MAX_TITLE_CHARS);
    return value.length > 0 ? value : null;
  }

  private resolveSkillIds(raw: unknown, skillIds: Set<number>): number[] {
    if (!Array.isArray(raw)) {
      return [];
    }
    const seen = new Set<number>();
    const result: number[] = [];
    for (const rawId of raw) {
      const id = Number(rawId);
      if (!Number.isInteger(id) || !skillIds.has(id) || seen.has(id)) {
        continue;
      }
      seen.add(id);
      result.push(id);
    }
    return result;
  }
}
