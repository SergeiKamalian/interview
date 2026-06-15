import { BadRequestException, Injectable } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import type { DbQueryParam } from '../../../common/database/database.types';
import { InterviewCoreRepository } from '../../interview-core/interview-core.repository';
import type { InterviewCheckpointStateEntity } from '../entities/interview-checkpoint-state.entity';
import { CheckpointStateRepository } from '../repositories/checkpoint-state.repository';

type QueryFn = <T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params?: DbQueryParam[],
) => Promise<T>;

@Injectable()
export class CheckpointStateService {
  constructor(
    private readonly interviewRepository: InterviewCoreRepository,
    private readonly checkpointStateRepository: CheckpointStateRepository,
  ) {}

  async ensureCheckpointStatesForQuestion(
    input: {
      companyId: number;
      attemptId: number;
      interviewQuestionId: number;
    },
    query?: QueryFn,
  ): Promise<InterviewCheckpointStateEntity[]> {
    const snapshotCheckpoints =
      await this.interviewRepository.findCheckpointsByInterviewQuestionId(
        input.interviewQuestionId,
      );

    if (snapshotCheckpoints.length === 0) {
      throw new BadRequestException({
        message: 'No checkpoints found in interview question snapshot',
        code: 'CHECKPOINTS_NOT_FOUND',
      });
    }

    return this.checkpointStateRepository.ensureForQuestion(
      {
        companyId: input.companyId,
        attemptId: input.attemptId,
        interviewQuestionId: input.interviewQuestionId,
        checkpoints: snapshotCheckpoints.map((checkpoint) => ({
          checkpointKey: checkpoint.checkpointKey,
          maxScore: checkpoint.score,
        })),
      },
      query,
    );
  }

  async applyCandidateDeclinedKnowledge(input: {
    attemptId: number;
    interviewQuestionId: number;
  }): Promise<number> {
    return this.checkpointStateRepository.skipCheckpointsOnCandidateDecline(
      input.attemptId,
      input.interviewQuestionId,
    );
  }
}
