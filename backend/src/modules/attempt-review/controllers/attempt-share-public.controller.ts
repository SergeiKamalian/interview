import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { AttemptShareService } from '../services/attempt-share.service';

@Controller('api/public/attempt-share')
export class AttemptSharePublicController {
  constructor(private readonly shareService: AttemptShareService) {}

  @Get(':token')
  async getSharedSummary(@Param('token') tokenRaw: string) {
    const token = tokenRaw?.trim();

    if (!token || token.length > 64) {
      throw new NotFoundException('Share link not found');
    }

    return this.shareService.getPublicSummary(token);
  }
}
