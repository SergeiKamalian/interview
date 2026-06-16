import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createReadStream, constants as fsConstants } from 'node:fs';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { extname, join, resolve } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { getMediaStorageConfig } from '../../common/config/media-storage.schema';

export type StoredMediaFile = {
  storageBucket: string;
  storageKey: string;
  mimeType: string;
  fileSizeBytes: number;
};

const MIME_EXTENSION: Record<string, string> = {
  'audio/webm': '.webm',
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
  'audio/x-wav': '.wav',
  'audio/ogg': '.ogg',
  'audio/mp4': '.m4a',
};

@Injectable()
export class MediaStorageService {
  constructor(private readonly configService: ConfigService) {}

  getAudioMaxBytes(): number {
    return getMediaStorageConfig(this.configService).audioMaxBytes;
  }

  getAudioMaxDurationSec(): number {
    return getMediaStorageConfig(this.configService).audioMaxDurationSec;
  }

  resolveAbsolutePath(storageKey: string): string {
    const config = getMediaStorageConfig(this.configService);
    const root = resolve(process.cwd(), config.localDir);
    const absolutePath = resolve(root, storageKey);

    if (!absolutePath.startsWith(root)) {
      throw new BadRequestException('Invalid storage key');
    }

    return absolutePath;
  }

  async saveAudioBuffer(input: {
    attemptId: number;
    buffer: Buffer;
    mimeType: string;
    originalName?: string;
  }): Promise<StoredMediaFile> {
    if (!input.buffer.byteLength) {
      throw new BadRequestException('Uploaded file is empty');
    }

    if (input.buffer.byteLength > this.getAudioMaxBytes()) {
      throw new BadRequestException('Audio file exceeds maximum size');
    }

    const extension = this.resolveExtension(
      input.mimeType,
      input.originalName,
    );
    const storageKey = join(
      'attempts',
      String(input.attemptId),
      `${randomUUID()}${extension}`,
    );
    const absolutePath = this.resolveAbsolutePath(storageKey);

    await mkdir(resolve(absolutePath, '..'), { recursive: true });
    await writeFile(absolutePath, input.buffer);

    return {
      storageBucket: 'local',
      storageKey,
      mimeType: input.mimeType,
      fileSizeBytes: input.buffer.byteLength,
    };
  }

  async openReadStream(storageKey: string): Promise<{
    stream: ReturnType<typeof createReadStream>;
    mimeType: string;
    fileSizeBytes: number;
  }> {
    const absolutePath = this.resolveAbsolutePath(storageKey);

    try {
      await access(absolutePath, fsConstants.F_OK);
    } catch {
      throw new NotFoundException('Media file not found');
    }

    const stream = createReadStream(absolutePath);
    const stats = await import('node:fs/promises').then(({ stat }) =>
      stat(absolutePath),
    );

    return {
      stream,
      mimeType: this.guessMimeTypeFromKey(storageKey),
      fileSizeBytes: stats.size,
    };
  }

  private resolveExtension(mimeType: string, originalName?: string): string {
    const fromOriginal = originalName
      ? extname(originalName).toLowerCase()
      : '';
    if (fromOriginal && fromOriginal.length <= 8) {
      return fromOriginal;
    }

    return MIME_EXTENSION[mimeType.toLowerCase()] ?? '.bin';
  }

  private guessMimeTypeFromKey(storageKey: string): string {
    const extension = extname(storageKey).toLowerCase();
    switch (extension) {
      case '.webm':
        return 'audio/webm';
      case '.mp3':
        return 'audio/mpeg';
      case '.wav':
        return 'audio/wav';
      case '.ogg':
        return 'audio/ogg';
      case '.m4a':
        return 'audio/mp4';
      default:
        return 'application/octet-stream';
    }
  }
}
