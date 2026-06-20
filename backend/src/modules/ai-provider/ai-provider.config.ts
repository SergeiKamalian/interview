import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  getAiConfig,
  toClientConfig,
  type AiConfig,
  type AiProviderClientConfig,
} from '../../common/config/ai.schema';
import {
  buildAiRoleModels,
  resolveModelForOperation,
} from './model-routing.util';

@Injectable()
export class AiProviderConfig {
  constructor(private readonly configService: ConfigService) {}

  getConfig(): AiConfig {
    return getAiConfig(this.configService);
  }

  getClientConfig(): AiProviderClientConfig {
    return toClientConfig(this.getConfig());
  }

  /**
   * Resolves the model for a given LLM operation type (role routing).
   * Falls back to the evaluation model for unknown/missing operation types,
   * so behavior is unchanged when no per-role env vars are set.
   */
  resolveModel(operationType?: string): string {
    return resolveModelForOperation(
      operationType,
      buildAiRoleModels(this.getConfig()),
    );
  }
}
