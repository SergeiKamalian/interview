import { Module, forwardRef } from '@nestjs/common';
import { InterviewCoreModule } from '../interview-core/interview-core.module';
import { InterviewAiMessageStreamService } from './interview-ai-message-stream.service';
import { InterviewRealtimeGateway } from './interview-realtime.gateway';
import { InterviewRealtimeService } from './interview-realtime.service';

@Module({
  imports: [forwardRef(() => InterviewCoreModule)],
  providers: [
    InterviewRealtimeService,
    InterviewAiMessageStreamService,
    InterviewRealtimeGateway,
  ],
  exports: [InterviewRealtimeService, InterviewAiMessageStreamService],
})
export class InterviewRealtimeModule {}
