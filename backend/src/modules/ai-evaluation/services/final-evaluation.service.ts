import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isAdaptiveInterviewEnabled } from '../../adaptive-interview/config/adaptive-interview-context.config';
import { QuestionSummaryRepository } from '../../adaptive-interview/repositories/question-summary.repository';
import { AiProviderService } from '../../ai-provider/ai-provider.service';
import { InterviewCoreRepository } from '../../interview-core/interview-core.repository';
import { computeAchievedLevel } from '../../scoring/achieved-level.util';
import { ScoringService } from '../../scoring/scoring.service';
import type { QuestionScoreInput } from '../../scoring/scoring.types';
import { AiUsageLogService } from '../../usage-logging/ai-usage-log.service';
import {
  buildFinalEvaluationSystemPrompt,
  buildFinalEvaluationUserPrompt,
  FINAL_EVALUATION_PROMPT_KEY,
  FINAL_EVALUATION_PROMPT_VERSION,
} from '../prompts/final-evaluation.prompt';
import { FinalEvaluationRepository } from '../repositories/final-evaluation.repository';
import { QuestionEvaluationRepository } from '../repositories/question-evaluation.repository';
import type { FinalEvaluationEntity } from '../entities/final-evaluation.entity';
import { AiResponseValidatorService } from './ai-response-validator.service';
import { buildFinalEvidenceContext } from '../utils/final-evidence-context.util';
import { buildScoreInputs } from '../utils/build-score-inputs.util';

@Injectable()
export class FinalEvaluationService {
  constructor(
    private readonly interviewRepository: InterviewCoreRepository,
    private readonly questionEvaluationRepository: QuestionEvaluationRepository,
    private readonly finalEvaluationRepository: FinalEvaluationRepository,
    private readonly questionSummaryRepository: QuestionSummaryRepository,
    private readonly scoringService: ScoringService,
    private readonly aiProviderService: AiProviderService,
    private readonly aiResponseValidatorService: AiResponseValidatorService,
    private readonly aiUsageLogService: AiUsageLogService,
  ) {}

  async evaluateAndPersistFinalEvaluation(
    companyId: number,
    attemptId: number,
  ): Promise<FinalEvaluationEntity> {
    const attempt = await this.interviewRepository.findAttemptByIdForCompany(
      attemptId,
      companyId,
    );

    if (!attempt) {
      throw new NotFoundException('Interview attempt not found');
    }

    if (attempt.status !== 'completed') {
      throw new BadRequestException({
        message: 'Final evaluation requires a completed attempt',
        code: 'ATTEMPT_NOT_COMPLETED',
      });
    }

    const [questionEvaluations, interviewQuestions, adaptiveSummaries] =
      await Promise.all([
        this.questionEvaluationRepository.findByAttemptId(companyId, attemptId),
        this.interviewRepository.listQuestionsForInterview(attempt.interviewId),
        isAdaptiveInterviewEnabled()
          ? this.questionSummaryRepository.findByAttemptId(attemptId)
          : Promise.resolve([]),
      ]);

    const useAdaptiveSummaries =
      isAdaptiveInterviewEnabled() &&
      adaptiveSummaries.length > 0;

    const questionMetaById = new Map(
      interviewQuestions.map((question) => [question.id, question]),
    );

    const scoreInputs: QuestionScoreInput[] = buildScoreInputs({
      useAdaptiveSummaries,
      adaptiveSummaries,
      questionEvaluations,
      questionMetaById,
    });

    const scoreResult =
      this.scoringService.calculateInterviewScore(scoreInputs);

    // Achieved level is a SEPARATE axis from the hire recommendation: it reuses the
    // exact `scoreInputs` (each carries its question's own `level`) but does NOT feed
    // back into scoring / mapHireRecommendation.
    const achievedLevelResult = computeAchievedLevel(scoreInputs);

    const correlationId = this.aiUsageLogService.createCorrelationId();

    const evidenceContext = useAdaptiveSummaries
      ? buildFinalEvidenceContext({
          summaries: adaptiveSummaries,
          totalScoreOutOfTen: scoreResult.finalScore,
          category: scoreResult.category,
          hireRecommendation: scoreResult.hireRecommendation,
          categoryBreakdown: scoreResult.breakdown.map(
            (item) =>
              `${item.categoryLabel}=${item.scoreNormalized / 10} weight=${item.weight} contribution=${item.contribution}`,
          ),
        })
      : null;

    const systemPrompt = buildFinalEvaluationSystemPrompt();
    const userPrompt = buildFinalEvaluationUserPrompt({
      finalScore: scoreResult.finalScore,
      totalWeight: scoreResult.totalWeight,
      averageScore: scoreResult.averageScore,
      strengthCategory: scoreResult.strengthCategory,
      category: scoreResult.category,
      hireRecommendation: scoreResult.hireRecommendation,
      topicEvaluations: scoreResult.topics,
      questionSummaries: evidenceContext
        ? evidenceContext.questionSummaries
        : questionEvaluations.map(
            (evaluation) =>
              `Q${evaluation.interviewQuestionId}: ${evaluation.shortSummary ?? 'no summary'}`,
          ),
      categoryBreakdown: scoreResult.breakdown.map(
        (item) =>
          `${item.categoryLabel}=${item.scoreNormalized / 10} weight=${item.weight} contribution=${item.contribution}`,
      ),
      evidenceSource: evidenceContext?.source,
    });

    const completion = await this.aiProviderService.evaluateJson(
      systemPrompt,
      userPrompt,
      { attemptId, operationType: 'final_summary' },
    );

    const validation =
      this.aiResponseValidatorService.validateFinalEvaluationResponse(
        completion.content,
      );

    if (validation.status === 'invalid_ai_response') {
      await this.aiUsageLogService.logCompletion({
        companyId,
        interviewAttemptId: attemptId,
        operationType: 'final_summary',
        status: 'invalid_response',
        correlationId,
        model: completion.model,
        promptTokens: completion.usage.promptTokens,
        completionTokens: completion.usage.completionTokens,
        latencyMs: completion.latencyMs,
      });

      this.aiResponseValidatorService.logInvalidResponse(
        'final',
        validation.errors,
        completion.content,
      );

      throw new BadRequestException({
        message: 'Final evaluation AI response was invalid',
        code: 'INVALID_FINAL_AI_RESPONSE',
      });
    }

    await this.aiUsageLogService.logCompletion({
      companyId,
      interviewAttemptId: attemptId,
      operationType: 'final_summary',
      status: 'success',
      correlationId,
      model: completion.model,
      promptTokens: completion.usage.promptTokens,
      completionTokens: completion.usage.completionTokens,
      latencyMs: completion.latencyMs,
    });

    return this.finalEvaluationRepository.upsertByAttemptId({
      companyId,
      interviewAttemptId: attemptId,
      totalScore: scoreResult.finalScore,
      category: scoreResult.category,
      hireRecommendation: scoreResult.hireRecommendation,
      achievedLevel: achievedLevelResult.achievedLevel,
      achievedLevelMethod: achievedLevelResult.method,
      summary: validation.data.summary,
      detailedSummary: validation.data.detailedSummary,
      strengths: validation.data.strengths,
      weaknesses: validation.data.weaknesses,
      risks: validation.data.risks,
      rawResponse: {
        promptKey: FINAL_EVALUATION_PROMPT_KEY,
        promptVersion: FINAL_EVALUATION_PROMPT_VERSION,
        model: completion.model,
        deterministicScore: scoreResult,
        // Full achieved-level result (perLevel breakdown + note) so the report
        // layer can expose levelBreakdown without recomputing. The achievedLevel
        // / method columns remain the source of truth for filtering (talent pool).
        achievedLevelResult,
        narrative: validation.data,
        evidenceContext,
      },
      needsManualReview: scoreResult.needsManualReview,
    });
  }

  async getFinalEvaluationByAttempt(
    companyId: number,
    attemptId: number,
  ): Promise<FinalEvaluationEntity | null> {
    return this.finalEvaluationRepository.findByAttemptId(companyId, attemptId);
  }

  /**
   * Collects the same `scoreInputs` (level/score/maxScore per question) that the
   * live final evaluation uses, WITHOUT running the LLM or the deterministic
   * scoring. Used by the achieved_level backfill (TASK-18.9) to recompute the
   * demonstrated level on attempts evaluated before migration 023.
   *
   * Missing per-question data is represented as zero-score inputs, matching the
   * live final evaluation path. Returns `null` only when the interview has no
   * question rows to score.
   */
  async collectScoreInputs(
    companyId: number,
    attemptId: number,
    interviewId: number,
  ): Promise<QuestionScoreInput[] | null> {
    const [questionEvaluations, interviewQuestions, adaptiveSummaries] =
      await Promise.all([
        this.questionEvaluationRepository.findByAttemptId(companyId, attemptId),
        this.interviewRepository.listQuestionsForInterview(interviewId),
        isAdaptiveInterviewEnabled()
          ? this.questionSummaryRepository.findByAttemptId(attemptId)
          : Promise.resolve([]),
      ]);

    const useAdaptiveSummaries =
      isAdaptiveInterviewEnabled() &&
      adaptiveSummaries.length > 0;

    const questionMetaById = new Map(
      interviewQuestions.map((question) => [question.id, question]),
    );

    const scoreInputs = buildScoreInputs({
      useAdaptiveSummaries,
      adaptiveSummaries,
      questionEvaluations,
      questionMetaById,
    });

    return scoreInputs.length > 0 ? scoreInputs : null;
  }
}
