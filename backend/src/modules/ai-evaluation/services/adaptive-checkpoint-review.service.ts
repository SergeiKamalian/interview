import { Injectable, NotFoundException } from '@nestjs/common';
import type { RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../common/database/database.service';
import { CheckpointStateRepository } from '../../adaptive-interview/repositories/checkpoint-state.repository';
import {
  accuracyPercent,
  coveragePercent,
  depthLabelRu,
  parseAccuracyFromRationale,
  parseCoverageFromRationale,
  parseDepthFromRationale,
} from '../../adaptive-interview/utils/checkpoint-depth.util';
import { aggregateCheckpointRedFlags } from '../../adaptive-interview/utils/checkpoint-red-flags.util';
import { parseCheckpointEvaluationHints } from '../../adaptive-interview/types/checkpoint-evaluation-hints.type';
import { deriveProbeStatus } from '../../adaptive-interview/utils/probe-policy.util';
import type { CheckpointStateStatus } from '../../adaptive-interview/types/checkpoint-state-status.type';
import type {
  AdaptiveCheckpointReviewType,
  AdaptiveCheckpointStateType,
  AdaptiveQuestionReviewType,
} from '../graphql/adaptive-checkpoint-review.type';

interface QuestionRow extends RowDataPacket {
  interview_question_id: number;
  question_text: string;
  ideal_answer: string;
}

interface CheckpointDefRow extends RowDataPacket {
  interview_question_id: number;
  checkpoint_key: string;
  title: string;
  score: number;
  evaluation_hints: unknown;
}

@Injectable()
export class AdaptiveCheckpointReviewService {
  constructor(
    private readonly database: DatabaseService,
    private readonly checkpointStateRepository: CheckpointStateRepository,
  ) {}

  async getByAttempt(
    companyId: number,
    attemptId: number,
  ): Promise<AdaptiveCheckpointReviewType> {
    const attemptRows = await this.database.query<RowDataPacket[]>(
      `SELECT id FROM interview_attempts WHERE id = ? AND company_id = ? LIMIT 1`,
      [attemptId, companyId],
    );

    if (!attemptRows[0]) {
      throw new NotFoundException('Interview attempt not found');
    }

    const questionRows = await this.database.query<QuestionRow[]>(
      `SELECT iq.id AS interview_question_id, iq.question_text, iq.ideal_answer
       FROM interview_questions iq
       INNER JOIN interview_attempts ia ON ia.interview_id = iq.interview_id
       WHERE ia.id = ?
       ORDER BY iq.sort_order ASC`,
      [attemptId],
    );

    const checkpointDefs = await this.database.query<CheckpointDefRow[]>(
      `SELECT iqc.interview_question_id, iqc.checkpoint_key, iqc.title, iqc.score, iqc.evaluation_hints
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

    const questionGroups: AdaptiveQuestionReviewType[] = [];
    const allRedFlagInputs: Array<{
      checkpointKey: string;
      checkpointTitle: string;
      rationale: string | null;
      evidenceSummary: string | null;
      status: string;
      evaluationHints: ReturnType<typeof parseCheckpointEvaluationHints>;
    }> = [];

    for (const question of questionRows) {
      const states = await this.checkpointStateRepository.findByAttemptAndQuestion(
        attemptId,
        question.interview_question_id,
      );
      const defs = defsByQuestion.get(question.interview_question_id) ?? [];
      const stateByKey = new Map(states.map((state) => [state.checkpointKey, state]));
      const questionMaxScore = defs.reduce((total, def) => total + def.score, 0);

      const checkpoints: AdaptiveCheckpointStateType[] = defs.map((def) => {
        const state = stateByKey.get(def.checkpoint_key);
        const rationale = state?.rationale ?? null;
        const depth = parseDepthFromRationale(rationale);
        const coverage = parseCoverageFromRationale(rationale);
        const accuracy = parseAccuracyFromRationale(rationale);
        const evaluationHints = parseCheckpointEvaluationHints(def.evaluation_hints);
        const probeStatus = deriveProbeStatus({
          checkpoint: {
            checkpointKey: def.checkpoint_key,
            title: def.title,
            expected: '',
            score: def.score,
            sortOrder: 0,
            evaluationHints,
          },
          state: {
            status: (state?.status ?? 'unseen') as CheckpointStateStatus,
            scoreAwarded: state?.scoreAwarded ?? 0,
            maxScore: state?.maxScore ?? def.score,
            followUpCount: state?.followUpCount ?? 0,
            rationale,
          },
          hints: evaluationHints,
          questionMaxScore: questionMaxScore,
        });

        const mapped: AdaptiveCheckpointStateType = {
          checkpointKey: def.checkpoint_key,
          checkpointTitle: def.title,
          status: state?.status ?? 'unseen',
          scoreAwarded: state?.scoreAwarded ?? 0,
          maxScore: state?.maxScore ?? 0,
          rationale,
          evidenceSummary: state?.evidenceSummary ?? null,
          confidence: state?.confidence ?? null,
          needsManualReview: state?.needsManualReview ?? false,
          depthLabel: depthLabelRu(depth),
          probeStatus,
          coveragePercent: coveragePercent(coverage),
          accuracyPercent: accuracyPercent(accuracy),
        };

        allRedFlagInputs.push({
          checkpointKey: mapped.checkpointKey,
          checkpointTitle: mapped.checkpointTitle,
          rationale: mapped.rationale ?? null,
          evidenceSummary: mapped.evidenceSummary ?? null,
          status: mapped.status,
          evaluationHints: parseCheckpointEvaluationHints(def.evaluation_hints),
        });

        return mapped;
      });

      questionGroups.push({
        interviewQuestionId: String(question.interview_question_id),
        questionText: question.question_text,
        idealAnswer: question.ideal_answer,
        needsManualReview: checkpoints.some((item) => item.needsManualReview),
        checkpoints,
      });
    }

    const redFlags = aggregateCheckpointRedFlags(allRedFlagInputs).map(
      (flag) => ({
        checkpointKey: flag.checkpointKey,
        checkpointTitle: flag.checkpointTitle,
        summary: flag.summary,
        candidateQuote: flag.candidateQuote,
        severity: flag.severity,
      }),
    );

    return {
      attemptId: String(attemptId),
      needsManualReview: questionGroups.some((group) => group.needsManualReview),
      redFlags,
      questionGroups,
    };
  }
}
