import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  getElevenLabsConfig,
  type ElevenLabsConfig,
} from '../../common/config/elevenlabs.schema';

@Injectable()
export class ElevenLabsConfigService {
  constructor(private readonly configService: ConfigService) {}

  getConfig(): ElevenLabsConfig {
    return getElevenLabsConfig(this.configService);
  }

  isTtsEnabled(): boolean {
    const config = this.getConfig();
    return config.ttsEnabled && config.apiKey.length > 0;
  }
}
