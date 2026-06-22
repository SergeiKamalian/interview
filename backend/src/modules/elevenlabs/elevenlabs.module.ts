import { Module } from '@nestjs/common';
import { UsageLoggingModule } from '../usage-logging/usage-logging.module';
import { ElevenLabsConfigService } from './elevenlabs.config';
import { ElevenLabsTtsService } from './elevenlabs-tts.service';
import { ThinkingSoundController } from './thinking-sound.controller';
import { ThinkingSoundService } from './thinking-sound.service';

@Module({
  imports: [UsageLoggingModule],
  controllers: [ThinkingSoundController],
  providers: [
    ElevenLabsConfigService,
    ElevenLabsTtsService,
    ThinkingSoundService,
  ],
  exports: [
    ElevenLabsConfigService,
    ElevenLabsTtsService,
    ThinkingSoundService,
  ],
})
export class ElevenLabsModule {}
