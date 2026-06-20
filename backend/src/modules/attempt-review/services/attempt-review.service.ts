import { Injectable } from '@nestjs/common';
import type {
  AttemptReviewDecisionHistoryPayloadType,
  AttemptReviewNoteType,
  AttemptReviewPayloadType,
  CreateAttemptReviewNoteInput,
  SetAttemptAiVerdictInput,
  SetAttemptCompanyDecisionInput,
  UpdateAttemptReviewNoteInput,
} from '../graphql/attempt-review.type';
import { DecisionAuditEventSourceEnum } from '../graphql/attempt-review.type';
import { AttemptReviewNotesRepository } from '../repositories/attempt-review-notes.repository';
import { AttemptReviewRepository } from '../repositories/attempt-review.repository';

@Injectable()
export class AttemptReviewService {
  constructor(
    private readonly repository: AttemptReviewRepository,
    private readonly notesRepository: AttemptReviewNotesRepository,
  ) {}

  async markReviewStarted(input: {
    companyId: number;
    attemptId: number;
    userId: number;
  }): Promise<AttemptReviewPayloadType> {
    const record = await this.repository.markReviewStarted(input);

    return this.toPayload(String(input.attemptId), record);
  }

  async setAiVerdict(
    companyId: number,
    userId: number,
    input: SetAttemptAiVerdictInput,
  ): Promise<AttemptReviewPayloadType> {
    const record = await this.repository.setAiVerdict({
      companyId,
      attemptId: Number(input.attemptId),
      userId,
      verdict: input.verdict,
      reason: input.reason,
    });

    return this.toPayload(input.attemptId, record);
  }

  async setCompanyDecision(
    companyId: number,
    userId: number,
    input: SetAttemptCompanyDecisionInput,
  ): Promise<AttemptReviewPayloadType> {
    const record = await this.repository.setCompanyDecision({
      companyId,
      attemptId: Number(input.attemptId),
      userId,
      decision: input.decision,
      reason: input.reason,
    });

    return this.toPayload(input.attemptId, record);
  }

  async listDecisionAuditHistory(
    companyId: number,
    attemptId: string,
    filters: { page: number; pageSize: number },
  ): Promise<AttemptReviewDecisionHistoryPayloadType> {
    const page = Math.max(filters.page ?? 1, 1);
    const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 1), 100);
    const result = await this.repository.listDecisionAuditEvents({
      companyId,
      attemptId: Number(attemptId),
      page,
      pageSize,
    });

    return {
      items: result.items.map((item) => ({
        eventId: item.eventId,
        source:
          item.source === 'shortlist'
            ? DecisionAuditEventSourceEnum.shortlist
            : DecisionAuditEventSourceEnum.attempt_review,
        action: item.action,
        previousValue: item.previousValue,
        newValue: item.newValue,
        reason: item.reason,
        actorEmail: item.actorEmail,
        actorName: item.actorName,
        occurredAt: item.occurredAt,
      })),
      total: result.total,
      page,
      pageSize,
    };
  }

  async listNotes(
    companyId: number,
    attemptId: number,
  ): Promise<AttemptReviewNoteType[]> {
    const notes = await this.notesRepository.listForAttempt(
      companyId,
      attemptId,
    );

    return notes.map((note) => this.toNotePayload(note));
  }

  async createNote(
    companyId: number,
    userId: number,
    input: CreateAttemptReviewNoteInput,
  ): Promise<AttemptReviewNoteType> {
    const note = await this.notesRepository.create({
      companyId,
      attemptId: Number(input.attemptId),
      userId,
      body: input.body,
    });

    return this.toNotePayload(note);
  }

  async updateNote(
    companyId: number,
    userId: number,
    input: UpdateAttemptReviewNoteInput,
  ): Promise<AttemptReviewNoteType> {
    const note = await this.notesRepository.update({
      companyId,
      noteId: Number(input.noteId),
      userId,
      body: input.body,
    });

    return this.toNotePayload(note);
  }

  toNotePayload(note: {
    id: number;
    attemptId: number;
    body: string;
    authorId: number;
    authorName: string;
    createdAt: Date;
    updatedAt: Date;
  }): AttemptReviewNoteType {
    return {
      id: String(note.id),
      attemptId: String(note.attemptId),
      body: note.body,
      authorId: String(note.authorId),
      authorName: note.authorName,
      createdAt: Math.floor(note.createdAt.getTime() / 1000),
      updatedAt: Math.floor(note.updatedAt.getTime() / 1000),
    };
  }

  toPayload(
    attemptId: string,
    record: {
      reviewStatus: string;
      aiAssessmentVerdict: string;
      companyDecision: string;
      reviewedAt: Date | null;
    },
  ): AttemptReviewPayloadType {
    return {
      attemptId,
      reviewStatus:
        record.reviewStatus as AttemptReviewPayloadType['reviewStatus'],
      aiAssessmentVerdict:
        record.aiAssessmentVerdict as AttemptReviewPayloadType['aiAssessmentVerdict'],
      companyDecision:
        record.companyDecision as AttemptReviewPayloadType['companyDecision'],
      reviewedAt: record.reviewedAt
        ? Math.floor(record.reviewedAt.getTime() / 1000)
        : null,
    };
  }
}
