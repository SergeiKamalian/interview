import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InterviewCoreRepository } from '../../interview-core/interview-core.repository';
import { AiUsageLogService } from '../../usage-logging/ai-usage-log.service';
import {
  mapCheckpointResultToGraphql,
  mapFinalEvaluationToGraphql,
  mapQuestionEvaluationToGraphql,
} from '../ai-evaluation.mapper';
import { mapCheckpointResultsForStorage } from '../checkpoint-result.mapper';
import type { CheckpointResultType } from '../graphql/checkpoint-result.type';
import type { FinalEvaluationType } from '../graphql/final-evaluation.type';
import type { QuestionEvaluationType } from '../graphql/question-evaluation.type';
import { buildQuestionEvaluationPayload } from '../question-evaluation.mapper';
import { CheckpointResultRepository } from '../repositories/checkpoint-result.repository';
import { QuestionEvaluationRepository } from '../repositories/question-evaluation.repository';
import type { CheckpointEvaluationRunResult } from '../types/checkpoint-evaluation.types';
import { CheckpointEvaluationService } from './checkpoint-evaluation.service';
import { EvaluationContextService } from './evaluation-context.service';
import { FinalEvaluationService } from './final-evaluation.service';
import { HallucinationGuardService } from './hallucination-guard.service';

export type EvaluateQuestionAnswerResult = CheckpointEvaluationRunResult & {
  questionEvaluationId?: number;
  checkpointResults?: CheckpointResultType[];
};

@Injectable()
export class AiEvaluationService {
  constructor(
    private readonly checkpointEvaluationService: CheckpointEvaluationService,
    private readonly evaluationContextService: EvaluationContextService,
    private readonly questionEvaluationRepository: QuestionEvaluationRepository,
    private readonly checkpointResultRepository: CheckpointResultRepository,
    private readonly hallucinationGuardService: HallucinationGuardService,
    private readonly finalEvaluationService: FinalEvaluationService,
    private readonly interviewRepository: InterviewCoreRepository,
    private readonly aiUsageLogService: AiUsageLogService,
  ) {}

  async evaluateAndPersistQuestionAnswer(
    attemptId: number,
    interviewQuestionId: number,
  ): Promise<EvaluateQuestionAnswerResult> {
    const context =
      await this.evaluationContextService.buildCheckpointEvaluationContext(
        attemptId,
        interviewQuestionId,
      );

    const correlationId = this.aiUsageLogService.createCorrelationId();
    const result =
      await this.checkpointEvaluationService.evaluateQuestionAnswer(
        attemptId,
        interviewQuestionId,
      );

    await this.aiUsageLogService.logCompletion({
      companyId: context.companyId,
      interviewAttemptId: attemptId,
      interviewMessageId: context.candidateMessageId,
      operationType: 'evaluate_answer',
      status:
        result.status === 'valid'
          ? 'success'
          : result.status === 'invalid_ai_response'
            ? 'invalid_response'
            : 'error',
      correlationId,
      model: result.model,
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
      latencyMs: result.latencyMs,
    });

    if (result.status !== 'valid') {
      return result;
    }

    const guardrail = this.hallucinationGuardService.validateCheckpointResults(
      context,
      result.response.checkpoints,
    );

    const payload = buildQuestionEvaluationPayload({
      companyId: context.companyId,
      interviewAttemptId: context.attemptId,
      interviewMessageId: context.candidateMessageId,
      interviewQuestionId: context.interviewQuestionId,
      checkpoints: context.checkpoints,
      checkpointResults: result.response.checkpoints,
      rawResponse: {
        promptKey: result.metadata.promptKey,
        promptVersion: result.metadata.promptVersion,
        model: result.model,
        repairAttempted: result.repairAttempted,
        guardrailViolations: guardrail.violations,
        checkpoints: result.response.checkpoints,
      },
      repairAttempted: result.repairAttempted || guardrail.needsManualReview,
    });

    if (guardrail.needsManualReview) {
      payload.needsManualReview = true;
    }

    const persisted =
      await this.questionEvaluationRepository.upsertByInterviewMessage(payload);

    const checkpointResults =
      await this.checkpointResultRepository.replaceByQuestionEvaluationId(
        persisted.id,
        mapCheckpointResultsForStorage(
          context.checkpoints,
          result.response.checkpoints,
        ),
      );

    return {
      ...result,
      questionEvaluationId: persisted.id,
      checkpointResults: checkpointResults.map((item) =>
        mapCheckpointResultToGraphql(item),
      ),
    };
  }

  async evaluateAttempt(companyId: number, attemptId: number) {
    const attempt = await this.interviewRepository.findAttemptByIdForCompany(
      attemptId,
      companyId,
    );

    if (!attempt) {
      throw new NotFoundException('Interview attempt not found');
    }

    if (attempt.status !== 'completed') {
      throw new BadRequestException({
        message: 'Attempt must be completed before AI evaluation',
        code: 'ATTEMPT_NOT_COMPLETED',
      });
    }

    const questions = await this.interviewRepository.listQuestionsForInterview(
      attempt.interviewId,
    );

    for (const question of questions) {
      await this.evaluateAndPersistQuestionAnswer(attemptId, question.id);
    }

    const finalEvaluation =
      await this.finalEvaluationService.evaluateAndPersistFinalEvaluation(
        companyId,
        attemptId,
      );

    return {
      questionCount: questions.length,
      finalEvaluation: mapFinalEvaluationToGraphql(
        finalEvaluation,
        finalEvaluation.rawResponse?.deterministicScore,
      ),
    };
  }

  async listQuestionEvaluationsByInterview(
    companyId: number,
    interviewId: number,
  ): Promise<QuestionEvaluationType[]> {
    const items = await this.questionEvaluationRepository.findByInterviewId(
      companyId,
      interviewId,
    );

    return Promise.all(
      items.map(async (item) => {
        const checkpointResults =
          await this.checkpointResultRepository.findByQuestionEvaluationId(
            item.id,
          );

        return mapQuestionEvaluationToGraphql(
          item,
          checkpointResults.map((checkpoint) =>
            mapCheckpointResultToGraphql(checkpoint),
          ),
        );
      }),
    );
  }

  async listQuestionEvaluationsByAttempt(
    companyId: number,
    attemptId: number,
  ): Promise<QuestionEvaluationType[]> {
    const items = await this.questionEvaluationRepository.findByAttemptId(
      companyId,
      attemptId,
    );

    return Promise.all(
      items.map(async (item) => {
        const checkpointResults =
          await this.checkpointResultRepository.findByQuestionEvaluationId(
            item.id,
          );

        return mapQuestionEvaluationToGraphql(
          item,
          checkpointResults.map((checkpoint) =>
            mapCheckpointResultToGraphql(checkpoint),
          ),
        );
      }),
    );
  }

  async getFinalEvaluationByAttempt(
    companyId: number,
    attemptId: number,
  ): Promise<FinalEvaluationType | null> {
    const entity =
      await this.finalEvaluationService.getFinalEvaluationByAttempt(
        companyId,
        attemptId,
      );

    if (!entity) {
      return null;
    }

    return mapFinalEvaluationToGraphql(
      entity,
      entity.rawResponse?.deterministicScore,
    );
  }
}
