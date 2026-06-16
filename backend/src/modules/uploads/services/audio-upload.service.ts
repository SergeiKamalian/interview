import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InterviewCoreRepository } from '../../interview-core/interview-core.repository';
import { MediaAssetService } from '../../media/media-asset.service';
import { MediaStorageService } from '../../media/media-storage.service';
import type {
  AudioUploadFieldsDto,
  AudioUploadResponse,
} from '../dto/audio-upload.dto';

const ALLOWED_AUDIO_MIME_TYPES = new Set([
  'audio/webm',
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/mp4',
]);

@Injectable()
export class AudioUploadService {
  constructor(
    private readonly interviewRepository: InterviewCoreRepository,
    private readonly mediaAssetService: MediaAssetService,
    private readonly mediaStorageService: MediaStorageService,
  ) {}

  async uploadCandidateAudio(
    fields: AudioUploadFieldsDto,
    file: Express.Multer.File | undefined,
  ): Promise<AudioUploadResponse> {
    if (!file?.buffer?.byteLength) {
      throw new BadRequestException('Audio file is required');
    }

    const attemptId = Number(fields.attemptId);
    if (!Number.isInteger(attemptId) || attemptId < 1) {
      throw new BadRequestException('Invalid attemptId');
    }

    const attempt = await this.interviewRepository.findAttemptById(
      attemptId,
      fields.publicToken.trim(),
    );

    if (!attempt) {
      throw new NotFoundException('Interview attempt not found');
    }

    if (attempt.status !== 'in_progress') {
      throw new BadRequestException('Interview attempt is not active');
    }

    const mimeType = (file.mimetype || 'application/octet-stream').toLowerCase();
    if (!ALLOWED_AUDIO_MIME_TYPES.has(mimeType)) {
      throw new BadRequestException(`Unsupported audio mime type: ${mimeType}`);
    }

    if (file.size > this.mediaStorageService.getAudioMaxBytes()) {
      throw new BadRequestException('Audio file exceeds maximum size');
    }

    const asset = await this.mediaAssetService.createAudioAsset({
      companyId: attempt.companyId,
      attemptId,
      buffer: file.buffer,
      mimeType,
      originalName: file.originalname,
      durationSec: fields.durationSec ?? null,
    });

    return {
      mediaAssetId: String(asset.id),
      storageKey: asset.storageKey,
      mimeType: asset.mimeType,
      fileSizeBytes: asset.fileSizeBytes,
      durationSec:
        asset.durationMs !== null ? Math.round(asset.durationMs / 1000) : null,
    };
  }
}
