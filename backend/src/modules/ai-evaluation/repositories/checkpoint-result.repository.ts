import { Injectable } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../common/database/database.service';
import { AI_EVALUATION_TABLES } from '../ai-evaluation.schema';
import type {
  CheckpointResultEntity,
  UpsertCheckpointResultData,
} from '../entities/checkpoint-result.entity';

interface CheckpointResultRow extends RowDataPacket {
  id: number;
  question_evaluation_id: number;
  checkpoint_key: string;
  matched: number;
  score_awarded: string;
  evidence_quote: string | null;
  created_at: Date;
}

@Injectable()
export class CheckpointResultRepository {
  constructor(private readonly database: DatabaseService) {}

  async replaceByQuestionEvaluationId(
    questionEvaluationId: number,
    items: UpsertCheckpointResultData[],
  ): Promise<CheckpointResultEntity[]> {
    await this.database.withTransaction(async (query) => {
      await query<ResultSetHeader>(
        `DELETE FROM ${AI_EVALUATION_TABLES.checkpointResults}
         WHERE question_evaluation_id = ?`,
        [questionEvaluationId],
      );

      for (const item of items) {
        await query<ResultSetHeader>(
          `INSERT INTO ${AI_EVALUATION_TABLES.checkpointResults} (
             question_evaluation_id, checkpoint_key, matched, score_awarded, evidence_quote
           ) VALUES (?, ?, ?, ?, ?)`,
          [
            questionEvaluationId,
            item.checkpointKey,
            item.matched ? 1 : 0,
            item.scoreAwarded,
            item.evidenceQuote,
          ],
        );
      }
    });

    return this.findByQuestionEvaluationId(questionEvaluationId);
  }

  async findByQuestionEvaluationId(
    questionEvaluationId: number,
  ): Promise<CheckpointResultEntity[]> {
    const rows = await this.database.query<CheckpointResultRow[]>(
      `SELECT id, question_evaluation_id, checkpoint_key, matched, score_awarded,
              evidence_quote, created_at
       FROM ${AI_EVALUATION_TABLES.checkpointResults}
       WHERE question_evaluation_id = ?
       ORDER BY checkpoint_key ASC`,
      [questionEvaluationId],
    );

    return rows.map((row) => this.mapRow(row));
  }

  private mapRow(row: CheckpointResultRow): CheckpointResultEntity {
    return {
      id: row.id,
      questionEvaluationId: row.question_evaluation_id,
      checkpointKey: row.checkpoint_key,
      matched: row.matched === 1,
      scoreAwarded: Number(row.score_awarded),
      evidenceQuote: row.evidence_quote,
      createdAt: row.created_at,
    };
  }
}
