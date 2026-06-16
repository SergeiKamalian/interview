import {
  Controller,
  Get,
  NotFoundException,
  Res,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { ThinkingSoundService } from './thinking-sound.service';

@Controller('api/media')
export class ThinkingSoundController {
  constructor(private readonly thinkingSoundService: ThinkingSoundService) {}

  @Get('thinking-sound')
  async getThinkingSound(
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    if (!this.thinkingSoundService.isAvailable()) {
      throw new NotFoundException('Thinking sound is not available');
    }

    const { stream, mimeType, fileSizeBytes, fileKey } =
      await this.thinkingSoundService.openThinkingSoundStream();

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', String(fileSizeBytes));
    res.setHeader('ETag', `"${fileKey}"`);
    res.setHeader('Cache-Control', 'private, no-cache');

    return new StreamableFile(stream);
  }
}
