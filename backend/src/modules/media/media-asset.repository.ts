import { Injectable } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../common/database/database.service';
import type {
  CreateMediaAssetInput,
  MediaAssetEntity,
} from './types/media-asset.types';

type MediaAssetRow = RowDataPacket & {
  id: number;
  company_id: number;
  interview_attempt_id: number;
  interview_message_id: number | null;
  media_type: 'audio' | 'video';
  storage_bucket: string;
  storage_key: string;
  mime_type: string;
  file_size_bytes: number;
  duration_ms: number | null;
  created_at: Date;
  updated_at: Date;
};

@Injectable()
export class MediaAssetRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(input: CreateMediaAssetInput): Promise<MediaAssetEntity> {
    const result = await this.database.query<ResultSetHeader>(
      `INSERT INTO media_assets (
         company_id, interview_attempt_id, interview_message_id,
         media_type, storage_bucket, storage_key, mime_type,
         file_size_bytes, duration_ms
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.companyId,
        input.interviewAttemptId,
        input.interviewMessageId ?? null,
        input.mediaType,
        input.storageBucket,
        input.storageKey,
        input.mimeType,
        input.fileSizeBytes,
        input.durationMs ?? null,
      ],
    );

    const asset = await this.findById(Number(result.insertId));
    if (!asset) {
      throw new Error('Failed to load media asset after insert');
    }

    return asset;
  }

  async findById(id: number): Promise<MediaAssetEntity | null> {
    const rows = await this.database.query<MediaAssetRow[]>(
      `SELECT id, company_id, interview_attempt_id, interview_message_id,
              media_type, storage_bucket, storage_key, mime_type,
              file_size_bytes, duration_ms, created_at, updated_at
       FROM media_assets
       WHERE id = ?
       LIMIT 1`,
      [id],
    );

    const row = rows[0];
    return row ? this.mapRow(row) : null;
  }

  async findByIdForAttempt(
    id: number,
    attemptId: number,
  ): Promise<MediaAssetEntity | null> {
    const rows = await this.database.query<MediaAssetRow[]>(
      `SELECT id, company_id, interview_attempt_id, interview_message_id,
              media_type, storage_bucket, storage_key, mime_type,
              file_size_bytes, duration_ms, created_at, updated_at
       FROM media_assets
       WHERE id = ? AND interview_attempt_id = ?
       LIMIT 1`,
      [id, attemptId],
    );

    const row = rows[0];
    return row ? this.mapRow(row) : null;
  }

  async linkToMessage(
    mediaAssetId: number,
    interviewMessageId: number,
    attemptId: number,
  ): Promise<void> {
    await this.database.query<ResultSetHeader>(
      `UPDATE media_assets
       SET interview_message_id = ?
       WHERE id = ? AND interview_attempt_id = ? AND interview_message_id IS NULL`,
      [interviewMessageId, mediaAssetId, attemptId],
    );
  }

  private mapRow(row: MediaAssetRow): MediaAssetEntity {
    return {
      id: row.id,
      companyId: row.company_id,
      interviewAttemptId: row.interview_attempt_id,
      interviewMessageId: row.interview_message_id,
      mediaType: row.media_type,
      storageBucket: row.storage_bucket,
      storageKey: row.storage_key,
      mimeType: row.mime_type,
      fileSizeBytes: Number(row.file_size_bytes),
      durationMs: row.duration_ms,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
