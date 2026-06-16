import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { InterviewCoreRepository } from '../interview-core/interview-core.repository';
import { MediaAssetService } from './media-asset.service';

@Controller('api/files')
export class MediaFilesController {
  constructor(
    private readonly mediaAssetService: MediaAssetService,
    private readonly interviewRepository: InterviewCoreRepository,
  ) {}

  @Get(':mediaAssetId')
  async streamFile(
    @Param('mediaAssetId') mediaAssetIdRaw: string,
    @Query('publicToken') publicToken: string,
    @Query('attemptId') attemptIdRaw: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const mediaAssetId = Number(mediaAssetIdRaw);
    const attemptId = Number(attemptIdRaw);

    if (
      !Number.isInteger(mediaAssetId) ||
      mediaAssetId < 1 ||
      !Number.isInteger(attemptId) ||
      attemptId < 1 ||
      !publicToken?.trim()
    ) {
      throw new NotFoundException('Media file not found');
    }

    const attempt = await this.interviewRepository.findAttemptById(
      attemptId,
      publicToken.trim(),
    );

    if (!attempt) {
      throw new NotFoundException('Media file not found');
    }

    const asset = await this.mediaAssetService.getAssetForAttempt(
      mediaAssetId,
      attemptId,
    );

    const { stream, mimeType, fileSizeBytes } =
      await this.mediaAssetService.openAssetStream(asset);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', String(fileSizeBytes));
    res.setHeader('Cache-Control', 'private, max-age=3600');

    return new StreamableFile(stream);
  }
}
