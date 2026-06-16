import { Module, forwardRef } from '@nestjs/common';
import { ElevenLabsModule } from '../elevenlabs/elevenlabs.module';
import { InterviewCoreModule } from '../interview-core/interview-core.module';
import { InterviewAiAudioStreamService } from './interview-ai-audio-stream.service';
import { InterviewAiMessageStreamService } from './interview-ai-message-stream.service';
import { InterviewCurrentQuestionSpeechService } from './interview-current-question-speech.service';
import { InterviewRealtimeGateway } from './interview-realtime.gateway';
import { InterviewRealtimeService } from './interview-realtime.service';

@Module({
  imports: [forwardRef(() => InterviewCoreModule), ElevenLabsModule],
  providers: [
    InterviewRealtimeService,
    InterviewAiAudioStreamService,
    InterviewCurrentQuestionSpeechService,
    InterviewAiMessageStreamService,
    InterviewRealtimeGateway,
  ],
  exports: [
    InterviewRealtimeService,
    InterviewAiMessageStreamService,
    InterviewAiAudioStreamService,
  ],
})
export class InterviewRealtimeModule {}
