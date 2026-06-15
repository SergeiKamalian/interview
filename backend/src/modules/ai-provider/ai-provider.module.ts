import { Global, Module } from '@nestjs/common';
import { AiProviderConfig } from './ai-provider.config';
import { AiProviderService } from './ai-provider.service';

@Global()
@Module({
  providers: [AiProviderConfig, AiProviderService],
  exports: [AiProviderConfig, AiProviderService],
})
export class AiProviderModule {}
