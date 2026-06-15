import { Module } from '@nestjs/common';
import { AiProviderModule } from '../ai-provider/ai-provider.module';
import { AuthModule } from '../auth/auth.module';
import { AiUsageLogRepository } from './ai-usage-log.repository';
import { AiUsageLogService } from './ai-usage-log.service';
import { UsageLoggingResolver } from './usage-logging.resolver';

@Module({
  imports: [AiProviderModule, AuthModule],
  providers: [AiUsageLogRepository, AiUsageLogService, UsageLoggingResolver],
  exports: [AiUsageLogService],
})
export class UsageLoggingModule {}
