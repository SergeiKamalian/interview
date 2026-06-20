import { Module } from '@nestjs/common';
import { AiEvaluationModule } from '../ai-evaluation/ai-evaluation.module';
import { AuthModule } from '../auth/auth.module';
import { CandidateComparisonResolver } from './graphql/candidate-comparison.resolver';
import { InterviewDetailsResolver } from './graphql/interview-details.resolver';
import { InterviewTranscriptResolver } from './graphql/interview-transcript.resolver';
import { InterviewsDashboardResolver } from './graphql/interviews-dashboard.resolver';
import { InterviewAttemptsPageRepository } from './repositories/interview-attempts-page.repository';
import { InterviewDetailsRepository } from './repositories/interview-details.repository';
import { InterviewTranscriptRepository } from './repositories/interview-transcript.repository';
import { InterviewsDashboardRepository } from './repositories/interviews-dashboard.repository';
import { CandidateComparisonService } from './services/candidate-comparison.service';
import { InterviewAttemptsPageService } from './services/interview-attempts-page.service';
import { InterviewDetailsService } from './services/interview-details.service';
import { InterviewTranscriptService } from './services/interview-transcript.service';
import { InterviewsDashboardService } from './services/interviews-dashboard.service';

@Module({
  imports: [AuthModule, AiEvaluationModule],
  providers: [
    InterviewsDashboardRepository,
    InterviewDetailsRepository,
    InterviewAttemptsPageRepository,
    InterviewTranscriptRepository,
    InterviewsDashboardService,
    CandidateComparisonService,
    InterviewAttemptsPageService,
    InterviewDetailsService,
    InterviewTranscriptService,
    InterviewsDashboardResolver,
    CandidateComparisonResolver,
    InterviewDetailsResolver,
    InterviewTranscriptResolver,
  ],
  exports: [
    InterviewsDashboardRepository,
    InterviewsDashboardService,
    InterviewDetailsRepository,
    InterviewTranscriptRepository,
  ],
})
export class InterviewsModule {}
