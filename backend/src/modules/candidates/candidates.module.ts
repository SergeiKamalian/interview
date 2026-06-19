import { Module } from '@nestjs/common';
import { AiEvaluationModule } from '../ai-evaluation/ai-evaluation.module';
import { AuthModule } from '../auth/auth.module';
import { CandidateReportResolver } from './graphql/candidate-report.resolver';
import { CandidatesDashboardResolver } from './graphql/candidates-dashboard.resolver';
import { CandidateReportRepository } from './repositories/candidate-report.repository';
import { CandidatesDashboardRepository } from './repositories/candidates-dashboard.repository';
import { CandidateReportService } from './services/candidate-report.service';
import { CandidatesDashboardService } from './services/candidates-dashboard.service';

@Module({
  imports: [AuthModule, AiEvaluationModule],
  providers: [
    CandidatesDashboardRepository,
    CandidateReportRepository,
    CandidatesDashboardService,
    CandidateReportService,
    CandidatesDashboardResolver,
    CandidateReportResolver,
  ],
  exports: [CandidatesDashboardService],
})
export class CandidatesModule {}
