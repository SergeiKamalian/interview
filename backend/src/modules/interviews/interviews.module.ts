import { Module } from '@nestjs/common';
import { AiEvaluationModule } from '../ai-evaluation/ai-evaluation.module';
import { AuthModule } from '../auth/auth.module';
import { InterviewDetailsResolver } from './graphql/interview-details.resolver';
import { InterviewTranscriptResolver } from './graphql/interview-transcript.resolver';
import { InterviewsDashboardResolver } from './graphql/interviews-dashboard.resolver';
import { InterviewDetailsRepository } from './repositories/interview-details.repository';
import { InterviewTranscriptRepository } from './repositories/interview-transcript.repository';
import { InterviewsDashboardRepository } from './repositories/interviews-dashboard.repository';
import { InterviewDetailsService } from './services/interview-details.service';
import { InterviewTranscriptService } from './services/interview-transcript.service';
import { InterviewsDashboardService } from './services/interviews-dashboard.service';

@Module({
  imports: [AuthModule, AiEvaluationModule],
  providers: [
    InterviewsDashboardRepository,
    InterviewDetailsRepository,
    InterviewTranscriptRepository,
    InterviewsDashboardService,
    InterviewDetailsService,
    InterviewTranscriptService,
    InterviewsDashboardResolver,
    InterviewDetailsResolver,
    InterviewTranscriptResolver,
  ],
  exports: [
    InterviewsDashboardRepository,
    InterviewDetailsRepository,
    InterviewTranscriptRepository,
  ],
})
export class InterviewsModule {}
