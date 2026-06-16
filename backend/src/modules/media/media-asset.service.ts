import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MediaAssetRepository } from './media-asset.repository';
import { MediaStorageService } from './media-storage.service';
import type { MediaAssetEntity } from './types/media-asset.types';

export const VOICE_ANSWER_PLACEHOLDER =
  'Голосовой ответ (ожидает транскрипцию)';

@Injectable()
export class MediaAssetService {
  constructor(
    private readonly mediaAssetRepository: MediaAssetRepository,
    private readonly mediaStorageService: MediaStorageService,
  ) {}

  async createAudioAsset(input: {
    companyId: number;
    attemptId: number;
    buffer: Buffer;
    mimeType: string;
    originalName?: string;
    durationSec?: number | null;
  }): Promise<MediaAssetEntity> {
    if (
      input.durationSec !== undefined &&
      input.durationSec !== null &&
      input.durationSec > this.mediaStorageService.getAudioMaxDurationSec()
    ) {
      throw new BadRequestException('Audio duration exceeds maximum allowed');
    }

    const stored = await this.mediaStorageService.saveAudioBuffer({
      attemptId: input.attemptId,
      buffer: input.buffer,
      mimeType: input.mimeType,
      originalName: input.originalName,
    });

    return this.mediaAssetRepository.create({
      companyId: input.companyId,
      interviewAttemptId: input.attemptId,
      mediaType: 'audio',
      storageBucket: stored.storageBucket,
      storageKey: stored.storageKey,
      mimeType: stored.mimeType,
      fileSizeBytes: stored.fileSizeBytes,
      durationMs:
        input.durationSec !== undefined && input.durationSec !== null
          ? Math.round(input.durationSec * 1000)
          : null,
    });
  }

  async linkPendingAssetToMessage(input: {
    mediaAssetId: number;
    attemptId: number;
    messageId: number;
  }): Promise<void> {
    const asset = await this.mediaAssetRepository.findByIdForAttempt(
      input.mediaAssetId,
      input.attemptId,
    );

    if (!asset) {
      throw new NotFoundException('Media asset not found for this attempt');
    }

    if (asset.interviewMessageId !== null) {
      throw new BadRequestException('Media asset is already linked to a message');
    }

    await this.mediaAssetRepository.linkToMessage(
      input.mediaAssetId,
      input.messageId,
      input.attemptId,
    );
  }

  async getAssetForAttempt(
    mediaAssetId: number,
    attemptId: number,
  ): Promise<MediaAssetEntity> {
    const asset = await this.mediaAssetRepository.findByIdForAttempt(
      mediaAssetId,
      attemptId,
    );

    if (!asset) {
      throw new NotFoundException('Media asset not found');
    }

    return asset;
  }

  openAssetStream(asset: MediaAssetEntity) {
    return this.mediaStorageService.openReadStream(asset.storageKey);
  }
}
