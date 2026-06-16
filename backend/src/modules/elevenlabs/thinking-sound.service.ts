import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import { constants as fsConstants, createReadStream } from 'node:fs';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { getMediaStorageConfig } from '../../common/config/media-storage.schema';
import { ElevenLabsConfigService } from './elevenlabs.config';
import { ElevenLabsTtsService } from './elevenlabs-tts.service';

@Injectable()
export class ThinkingSoundService {
  constructor(
    private readonly configService: ConfigService,
    private readonly elevenLabsConfigService: ElevenLabsConfigService,
    private readonly elevenLabsTtsService: ElevenLabsTtsService,
  ) {}

  isAvailable(): boolean {
    return this.elevenLabsTtsService.isEnabled();
  }

  async openThinkingSoundStream(): Promise<{
    stream: ReturnType<typeof createReadStream>;
    mimeType: string;
    fileSizeBytes: number;
    fileKey: string;
  }> {
    if (!this.isAvailable()) {
      throw new NotFoundException('Thinking sound is not available');
    }

    const { absolutePath, fileKey } = await this.ensureThinkingSoundFile();
    const stream = createReadStream(absolutePath);
    const stats = await import('node:fs/promises').then(({ stat }) =>
      stat(absolutePath),
    );

    return {
      stream,
      mimeType: 'audio/mpeg',
      fileSizeBytes: stats.size,
      fileKey,
    };
  }

  private async ensureThinkingSoundFile(): Promise<{
    absolutePath: string;
    fileKey: string;
  }> {
    const config = this.elevenLabsConfigService.getConfig();
    const phrase = config.thinkingPhrase;
    const synthesisText =
      this.elevenLabsTtsService.formatThinkingPhrase(phrase);
    const storage = getMediaStorageConfig(this.configService);

    const fileKey = createHash('sha256')
      .update(
        [
          config.voiceId,
          config.modelId,
          config.outputFormat,
          'thinking-v2',
          synthesisText,
        ].join('|'),
      )
      .digest('hex')
      .slice(0, 16);

    const relativePath = join('system', `thinking-${fileKey}.mp3`);
    const root = resolve(process.cwd(), storage.localDir);
    const absolutePath = resolve(root, relativePath);

    if (!absolutePath.startsWith(root)) {
      throw new NotFoundException('Invalid thinking sound path');
    }

    try {
      await access(absolutePath, fsConstants.F_OK);
      return { absolutePath, fileKey };
    } catch {
      const buffer =
        await this.elevenLabsTtsService.synthesizeThinkingToBuffer(phrase);
      if (buffer.byteLength === 0) {
        throw new NotFoundException('Failed to synthesize thinking sound');
      }

      await mkdir(resolve(absolutePath, '..'), { recursive: true });
      await writeFile(absolutePath, buffer);
      return { absolutePath, fileKey };
    }
  }
}
