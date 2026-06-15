import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  getAiConfig,
  toClientConfig,
  type AiConfig,
  type AiProviderClientConfig,
} from '../../common/config/ai.schema';

@Injectable()
export class AiProviderConfig {
  constructor(private readonly configService: ConfigService) {}

  getConfig(): AiConfig {
    return getAiConfig(this.configService);
  }

  getClientConfig(): AiProviderClientConfig {
    return toClientConfig(this.getConfig());
  }
}
