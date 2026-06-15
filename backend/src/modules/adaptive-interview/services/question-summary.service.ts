import { Injectable } from '@nestjs/common';
import { InterviewCoreRepository } from '../../interview-core/interview-core.repository';
import { CheckpointStateRepository } from '../repositories/checkpoint-state.repository';
import { FollowUpRepository } from '../repositories/follow-up.repository';
import { QuestionSummaryRepository } from '../repositories/question-summary.repository';
import type { InterviewQuestionSummaryEntity } from '../entities/interview-question-summary.entity';
import { buildQuestionSummaryFromCheckpointStates } from '../utils/build-question-summary.util';

@Injectable()
export class QuestionSummaryService {
  constructor(
    private readonly interviewRepository: InterviewCoreRepository,
    private readonly checkpointStateRepository: CheckpointStateRepository,
    private readonly followUpRepository: FollowUpRepository,
    private readonly questionSummaryRepository: QuestionSummaryRepository,
  ) {}

  async buildAndPersist(input: {
    companyId: number;
    attemptId: number;
    interviewQuestionId: number;
  }): Promise<InterviewQuestionSummaryEntity> {
    const [checkpoints, states, followUpCount] = await Promise.all([
      this.interviewRepository.findCheckpointsByInterviewQuestionId(
        input.interviewQuestionId,
      ),
      this.checkpointStateRepository.findByAttemptAndQuestion(
        input.attemptId,
        input.interviewQuestionId,
      ),
      this.followUpRepository.countUsedForQuestion(
        input.attemptId,
        input.interviewQuestionId,
      ),
    ]);

    const summaryData = buildQuestionSummaryFromCheckpointStates({
      companyId: input.companyId,
      attemptId: input.attemptId,
      interviewQuestionId: input.interviewQuestionId,
      checkpoints,
      states,
      followUpCount,
    });

    return this.questionSummaryRepository.upsert(summaryData);
  }

  async listByAttemptId(
    attemptId: number,
  ): Promise<InterviewQuestionSummaryEntity[]> {
    return this.questionSummaryRepository.findByAttemptId(attemptId);
  }
}
