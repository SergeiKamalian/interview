import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AiProviderService } from '../../ai-provider/ai-provider.service';
import { AiResponseValidatorService } from '../../ai-evaluation/services/ai-response-validator.service';
import { FinalEvaluationRepository } from '../../ai-evaluation/repositories/final-evaluation.repository';
import type { FinalEvaluationEntity } from '../../ai-evaluation/entities/final-evaluation.entity';
import type { CandidateComparisonAdviceType } from '../graphql/candidate-comparison.type';
import { InterviewDetailsRepository } from '../repositories/interview-details.repository';
import {
  buildCandidateComparisonSystemPrompt,
  buildCandidateComparisonUserPrompt,
} from '../prompts/candidate-comparison.prompt';

type ComparedAttempt = {
  attemptId: string;
  candidateName: string;
  candidateEmail: string;
  evaluation: FinalEvaluationEntity;
};

type RawComparisonUseCase = {
  title?: unknown;
  recommendedAttemptId?: unknown;
  rationale?: unknown;
};

type RawComparisonCandidateNote = {
  attemptId?: unknown;
  bestFor?: unknown;
  strengths?: unknown;
  risks?: unknown;
  followUpQuestions?: unknown;
};

type RawComparisonRankingEntry = {
  attemptId?: unknown;
  rank?: unknown;
  headline?: unknown;
  tradeOff?: unknown;
};

type RawComparisonAdvice = {
  recommendedAttemptId?: unknown;
  recommendationTitle?: unknown;
  recommendationSummary?: unknown;
  decisionRationale?: unknown;
  ranking?: unknown;
  useCases?: unknown;
  candidateNotes?: unknown;
  caveats?: unknown;
};

@Injectable()
export class CandidateComparisonService {
  constructor(
    private readonly interviewDetailsRepository: InterviewDetailsRepository,
    private readonly finalEvaluationRepository: FinalEvaluationRepository,
    private readonly aiProviderService: AiProviderService,
    private readonly aiResponseValidatorService: AiResponseValidatorService,
  ) {}

  async compareCandidates(
    companyId: number,
    interviewId: number,
    attemptIds: string[],
  ): Promise<CandidateComparisonAdviceType> {
    const normalizedAttemptIds = [
      ...new Set(attemptIds.map((id) => String(id))),
    ];
    if (normalizedAttemptIds.length < 2 || normalizedAttemptIds.length > 5) {
      throw new BadRequestException(
        'Between two and five candidates are required',
      );
    }

    const details = await this.interviewDetailsRepository.getInterviewDetails(
      companyId,
      interviewId,
    );
    const attempts = normalizedAttemptIds.map((attemptId) => {
      const attempt = details.attempts.find(
        (item) => String(item.id) === attemptId,
      );
      if (!attempt) {
        throw new BadRequestException(
          'Candidate attempt does not belong to this interview',
        );
      }

      return attempt;
    });

    const comparedAttempts: ComparedAttempt[] = [];
    for (const attempt of attempts) {
      if (attempt.status !== 'completed') {
        throw new BadRequestException(
          'Only completed candidate attempts can be compared',
        );
      }

      const evaluation = await this.finalEvaluationRepository.findByAttemptId(
        companyId,
        attempt.id,
      );
      if (!evaluation) {
        throw new BadRequestException(
          'All candidates must have ready final evaluations',
        );
      }

      comparedAttempts.push({
        attemptId: String(attempt.id),
        candidateName: attempt.candidate_name,
        candidateEmail: attempt.candidate_email,
        evaluation,
      });
    }

    const result = await this.aiProviderService.evaluateJson(
      buildCandidateComparisonSystemPrompt(comparedAttempts.length),
      buildCandidateComparisonUserPrompt({
        interview: {
          title: details.interview.title,
          jobRole: details.interview.job_role,
          level: details.interview.level,
          professionName: details.interview.profession_name,
          skills: details.skills,
        },
        attempts: comparedAttempts,
      }),
      {
        operationType: 'candidate_comparison',
      },
    );

    const parsed = this.aiResponseValidatorService.parseJson(result.content);
    if (!parsed.ok) {
      throw new ServiceUnavailableException(
        'AI comparison returned invalid JSON',
      );
    }

    return this.normalizeAdvice(parsed.value, comparedAttempts);
  }

  private normalizeAdvice(
    value: unknown,
    attempts: ComparedAttempt[],
  ): CandidateComparisonAdviceType {
    const raw = isRecord(value) ? (value as RawComparisonAdvice) : {};
    const attemptIds = new Set(attempts.map((attempt) => attempt.attemptId));
    const candidateNameByAttemptId = new Map(
      attempts.map((attempt) => [attempt.attemptId, attempt.candidateName]),
    );

    return {
      recommendedAttemptId: this.normalizeAttemptId(
        raw.recommendedAttemptId,
        attemptIds,
      ),
      recommendationTitle: toNonEmptyString(
        raw.recommendationTitle,
        'Нет однозначного победителя',
      ),
      recommendationSummary: toNonEmptyString(
        raw.recommendationSummary,
        'ИИ не смог сформировать уверенный итоговый совет. Проверьте кандидатов вручную.',
      ),
      decisionRationale: toStringArray(raw.decisionRationale).slice(0, 5),
      ranking: this.normalizeRanking(raw.ranking, attempts, attemptIds),
      useCases: toArray(raw.useCases)
        .map((item) => this.normalizeUseCase(item, attemptIds))
        .slice(0, 5),
      candidateNotes: attempts.map((attempt) =>
        this.normalizeCandidateNote(
          toArray(raw.candidateNotes).find(
            (item) =>
              isRecord(item) &&
              String((item as RawComparisonCandidateNote).attemptId) ===
                attempt.attemptId,
          ),
          attempt,
          candidateNameByAttemptId,
        ),
      ),
      caveats: toStringArray(raw.caveats).slice(0, 4),
    };
  }

  private normalizeRanking(
    value: unknown,
    attempts: ComparedAttempt[],
    attemptIds: Set<string>,
  ): CandidateComparisonAdviceType['ranking'] {
    const normalized = toArray(value)
      .map((item) => this.normalizeRankingEntry(item, attemptIds))
      .filter(
        (item): item is CandidateComparisonAdviceType['ranking'][number] =>
          item !== null,
      );

    const seenAttemptIds = new Set<string>();
    const deduped = normalized.filter((entry) => {
      if (seenAttemptIds.has(entry.attemptId)) {
        return false;
      }

      seenAttemptIds.add(entry.attemptId);
      return true;
    });

    if (deduped.length === attempts.length) {
      return deduped
        .sort((left, right) => left.rank - right.rank)
        .slice(0, attempts.length);
    }

    return attempts.map((attempt, index) => ({
      attemptId: attempt.attemptId,
      rank: index + 1,
      headline: 'Нужна ручная проверка позиции в пуле.',
      tradeOff: 'ИИ не выделил trade-off для этого кандидата.',
    }));
  }

  private normalizeRankingEntry(
    value: unknown,
    attemptIds: Set<string>,
  ): CandidateComparisonAdviceType['ranking'][number] | null {
    const raw = isRecord(value) ? (value as RawComparisonRankingEntry) : {};
    const attemptId = typeof raw.attemptId === 'string' ? raw.attemptId : null;

    if (!attemptId || !attemptIds.has(attemptId)) {
      return null;
    }

    const rank =
      typeof raw.rank === 'number' && Number.isFinite(raw.rank)
        ? Math.max(1, Math.round(raw.rank))
        : 1;

    return {
      attemptId,
      rank,
      headline: toNonEmptyString(
        raw.headline,
        'Нужна ручная проверка позиции в пуле.',
      ),
      tradeOff: toNonEmptyString(
        raw.tradeOff,
        'ИИ не выделил trade-off для этого кандидата.',
      ),
    };
  }

  private normalizeUseCase(
    value: unknown,
    attemptIds: Set<string>,
  ): CandidateComparisonAdviceType['useCases'][number] {
    const raw = isRecord(value) ? (value as RawComparisonUseCase) : {};

    return {
      title: toNonEmptyString(raw.title, 'Кейс найма'),
      recommendedAttemptId: this.normalizeAttemptId(
        raw.recommendedAttemptId,
        attemptIds,
      ),
      rationale: toNonEmptyString(
        raw.rationale,
        'Недостаточно данных для уверенного вывода.',
      ),
    };
  }

  private normalizeCandidateNote(
    value: unknown,
    attempt: ComparedAttempt,
    candidateNameByAttemptId: Map<string, string>,
  ): CandidateComparisonAdviceType['candidateNotes'][number] {
    const raw = isRecord(value) ? (value as RawComparisonCandidateNote) : {};

    return {
      attemptId: attempt.attemptId,
      candidateName:
        candidateNameByAttemptId.get(attempt.attemptId) ??
        attempt.candidateName,
      bestFor: toNonEmptyString(
        raw.bestFor,
        'Нужна ручная проверка fit под роль.',
      ),
      strengths: toStringArray(raw.strengths).slice(0, 4),
      risks: toStringArray(raw.risks).slice(0, 4),
      followUpQuestions: toStringArray(raw.followUpQuestions).slice(0, 4),
    };
  }

  private normalizeAttemptId(
    value: unknown,
    attemptIds: Set<string>,
  ): string | null {
    const attemptId = typeof value === 'string' ? value : null;
    return attemptId && attemptIds.has(attemptId) ? attemptId : null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function toStringArray(value: unknown): string[] {
  return toArray(value)
    .map((item) =>
      typeof item === 'string' ? localizeAiTerm(item.trim()) : '',
    )
    .filter(Boolean);
}

function toNonEmptyString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0
    ? localizeAiTerm(value.trim())
    : fallback;
}

function localizeAiTerm(value: string): string {
  return value.replace(/\bAI\b/g, 'ИИ');
}
