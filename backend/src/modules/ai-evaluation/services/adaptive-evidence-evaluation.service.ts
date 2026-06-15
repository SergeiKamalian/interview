import { Injectable, Logger } from '@nestjs/common';
import { CheckpointStateRepository } from '../../adaptive-interview/repositories/checkpoint-state.repository';
import { QuestionSummaryRepository } from '../../adaptive-interview/repositories/question-summary.repository';
import {
  mapCheckpointStatesToEvaluationResults,
  mapSnapshotCheckpointsToDefinitions,
} from '../../adaptive-interview/utils/map-checkpoint-states-to-evaluation.util';
import { InterviewCoreRepository } from '../../interview-core/interview-core.repository';
import { mapCheckpointResultsForStorage } from '../checkpoint-result.mapper';
import { buildQuestionEvaluationPayload } from '../question-evaluation.mapper';
import { CheckpointResultRepository } from '../repositories/checkpoint-result.repository';
import { QuestionEvaluationRepository } from '../repositories/question-evaluation.repository';

@Injectable()
export class AdaptiveEvidenceEvaluationService {
  private readonly logger = new Logger(AdaptiveEvidenceEvaluationService.name);

  constructor(
    private readonly interviewRepository: InterviewCoreRepository,
    private readonly checkpointStateRepository: CheckpointStateRepository,
    private readonly questionSummaryRepository: QuestionSummaryRepository,
    private readonly questionEvaluationRepository: QuestionEvaluationRepository,
    private readonly checkpointResultRepository: CheckpointResultRepository,
  ) {}

  async hasEvidenceForAttempt(attemptId: number): Promise<boolean> {
    const summaries = await this.questionSummaryRepository.findByAttemptId(
      attemptId,
    );

    return summaries.length > 0;
  }

  async syncQuestionEvaluationsFromEvidence(
    companyId: number,
    attemptId: number,
    interviewId: number,
  ): Promise<number> {
    const [questions, summaries] = await Promise.all([
      this.interviewRepository.listQuestionsForInterview(interviewId),
      this.questionSummaryRepository.findByAttemptId(attemptId),
    ]);

    if (summaries.length === 0) {
      return 0;
    }

    const summaryByQuestionId = new Map(
      summaries.map((summary) => [summary.interviewQuestionId, summary]),
    );

    let synced = 0;

    for (const question of questions) {
      const summary = summaryByQuestionId.get(question.id);
      if (!summary) {
        this.logger.warn(
          `Missing question summary attempt=${attemptId} question=${question.id}`,
        );
        continue;
      }

      const [checkpoints, states, messages] = await Promise.all([
        this.interviewRepository.findCheckpointsByInterviewQuestionId(
          question.id,
        ),
        this.checkpointStateRepository.findByAttemptAndQuestion(
          attemptId,
          question.id,
        ),
        this.interviewRepository.listMessages(attemptId),
      ]);

      const mainAnswerMessage = [...messages]
        .reverse()
        .find(
          (message) =>
            message.interviewQuestionId === question.id &&
            message.role === 'candidate' &&
            (message.messageKind === null ||
              message.messageKind === 'main_answer'),
        );

      if (!mainAnswerMessage) {
        this.logger.warn(
          `Main answer message not found attempt=${attemptId} question=${question.id}`,
        );
        continue;
      }

      const checkpointDefinitions =
        mapSnapshotCheckpointsToDefinitions(checkpoints);
      const checkpointResults = mapCheckpointStatesToEvaluationResults(states);

      const payload = buildQuestionEvaluationPayload({
        companyId,
        interviewAttemptId: attemptId,
        interviewMessageId: mainAnswerMessage.id,
        interviewQuestionId: question.id,
        checkpoints: checkpointDefinitions,
        checkpointResults,
        rawResponse: {
          source: 'adaptive_evidence',
          summaryId: summary.id,
          followUpCount: summary.followUpCount,
        },
        repairAttempted: summary.needsManualReview,
      });

      payload.score = summary.score;
      payload.maxScore = summary.maxScore;
      payload.shortSummary = summary.summary;
      payload.needsManualReview =
        summary.needsManualReview || payload.needsManualReview;

      const persisted =
        await this.questionEvaluationRepository.upsertByInterviewMessage(
          payload,
        );

      await this.checkpointResultRepository.replaceByQuestionEvaluationId(
        persisted.id,
        mapCheckpointResultsForStorage(
          checkpointDefinitions,
          checkpointResults,
        ),
      );

      synced += 1;
    }

    return synced;
  }
}
