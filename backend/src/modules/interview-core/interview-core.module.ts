import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AiEvaluationModule } from '../ai-evaluation/ai-evaluation.module';
import { AdaptiveInterviewModule } from '../adaptive-interview/adaptive-interview.module';
import { InterviewRealtimeModule } from '../interview-realtime/interview-realtime.module';
import { QuestionBankModule } from '../question-bank/question-bank.module';
import { InterviewCoreRepository } from './interview-core.repository';
import { InterviewCoreResolver } from './interview-core.resolver';
import { InterviewCoreService } from './interview-core.service';
import { InterviewPublicResolver } from './interview-public.resolver';
import { InterviewPublicService } from './interview-public.service';
import { PublicTokenService } from './public-token.service';

@Module({
  imports: [
    AuthModule,
    QuestionBankModule,
    forwardRef(() => AiEvaluationModule),
    forwardRef(() => AdaptiveInterviewModule),
    forwardRef(() => InterviewRealtimeModule),
  ],
  providers: [
    InterviewCoreRepository,
    InterviewCoreService,
    InterviewCoreResolver,
    InterviewPublicService,
    InterviewPublicResolver,
    PublicTokenService,
  ],
  exports: [
    InterviewCoreService,
    InterviewPublicService,
    InterviewCoreRepository,
  ],
})
export class InterviewCoreModule {}
