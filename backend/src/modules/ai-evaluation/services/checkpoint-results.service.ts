import { Injectable, NotFoundException } from '@nestjs/common';
import type { RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../common/database/database.service';
import { mapCheckpointResultToGraphql } from '../ai-evaluation.mapper';
import {
  CheckpointMatchStatusEnum,
  type CheckpointResultDetailType,
  type CheckpointResultsByAttemptType,
} from '../graphql/checkpoint-results-detail.type';
import { CheckpointResultRepository } from '../repositories/checkpoint-result.repository';
import { QuestionEvaluationRepository } from '../repositories/question-evaluation.repository';

interface QuestionRow extends RowDataPacket {
  interview_question_id: number;
  question_text: string;
}

interface CheckpointDefRow extends RowDataPacket {
  interview_question_id: number;
  checkpoint_key: string;
  title: string;
  score: string;
}

@Injectable()
export class CheckpointResultsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly questionEvaluationRepository: QuestionEvaluationRepository,
    private readonly checkpointResultRepository: CheckpointResultRepository,
  ) {}

  async getByAttempt(
    companyId: number,
    attemptId: number,
  ): Promise<CheckpointResultsByAttemptType> {
    const attemptRows = await this.database.query<RowDataPacket[]>(
      `SELECT id FROM interview_attempts WHERE id = ? AND company_id = ? LIMIT 1`,
      [attemptId, companyId],
    );

    if (!attemptRows[0]) {
      throw new NotFoundException('Interview attempt not found');
    }

    const evaluations = await this.questionEvaluationRepository.findByAttemptId(
      companyId,
      attemptId,
    );

    const questionRows = await this.database.query<QuestionRow[]>(
      `SELECT iq.id AS interview_question_id, iq.question_text
       FROM interview_questions iq
       INNER JOIN interview_attempts ia ON ia.interview_id = iq.interview_id
       WHERE ia.id = ?
       ORDER BY iq.sort_order ASC`,
      [attemptId],
    );

    const checkpointDefs = await this.database.query<CheckpointDefRow[]>(
      `SELECT iqc.interview_question_id,
              iqc.checkpoint_key,
              iqc.title,
              iqc.score
       FROM interview_question_checkpoints iqc
       INNER JOIN interview_questions iq ON iq.id = iqc.interview_question_id
       INNER JOIN interview_attempts ia ON ia.interview_id = iq.interview_id
       WHERE ia.id = ?
       ORDER BY iqc.sort_order ASC`,
      [attemptId],
    );

    const defsByQuestion = new Map<number, CheckpointDefRow[]>();
    for (const def of checkpointDefs) {
      const list = defsByQuestion.get(def.interview_question_id) ?? [];
      list.push(def);
      defsByQuestion.set(def.interview_question_id, list);
    }

    const evalByQuestion = new Map(
      evaluations.map((evaluation) => [evaluation.interviewQuestionId, evaluation]),
    );

    const questionGroups = await Promise.all(
      questionRows.map(async (question) => {
        const evaluation = evalByQuestion.get(question.interview_question_id);
        const defs = defsByQuestion.get(question.interview_question_id) ?? [];
        const checkpointEntities = evaluation
          ? await this.checkpointResultRepository.findByQuestionEvaluationId(
              evaluation.id,
            )
          : [];

        const checkpointMap = new Map(
          checkpointEntities.map((entity) => [
            entity.checkpointKey,
            mapCheckpointResultToGraphql(entity),
          ]),
        );

        const checkpoints: CheckpointResultDetailType[] = defs.map((def) => {
          const result = checkpointMap.get(def.checkpoint_key);
          const maxScore = Number(def.score);
          const scoreAwarded = result?.scoreAwarded ?? 0;

          return {
            id: result?.id ?? `${question.interview_question_id}-${def.checkpoint_key}`,
            checkpointKey: def.checkpoint_key,
            checkpointTitle: def.title,
            status: this.resolveStatus(scoreAwarded, maxScore, result?.matched ?? false),
            scoreAwarded,
            maxScore,
            evidenceQuote: result?.evidenceQuote ?? null,
            reasoningShort: result?.matched
              ? 'Checkpoint criteria satisfied in candidate answer.'
              : scoreAwarded > 0
                ? 'Partial coverage detected.'
                : 'Checkpoint not met.',
          };
        });

        return {
          interviewQuestionId: String(question.interview_question_id),
          questionText: question.question_text,
          needsManualReview: evaluation?.needsManualReview ?? false,
          checkpoints,
        };
      }),
    );

    return {
      attemptId: String(attemptId),
      questionGroups,
    };
  }

  private resolveStatus(
    scoreAwarded: number,
    maxScore: number,
    matched: boolean,
  ): CheckpointMatchStatusEnum {
    if (matched || scoreAwarded >= maxScore) {
      return CheckpointMatchStatusEnum.met;
    }

    if (scoreAwarded > 0) {
      return CheckpointMatchStatusEnum.partially_met;
    }

    return CheckpointMatchStatusEnum.not_met;
  }
}
