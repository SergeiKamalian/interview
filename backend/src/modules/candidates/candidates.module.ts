import { Module } from '@nestjs/common';
import { AiEvaluationModule } from '../ai-evaluation/ai-evaluation.module';
import { AuthModule } from '../auth/auth.module';
import { CandidateReportResolver } from './graphql/candidate-report.resolver';
import { CandidatesDashboardResolver } from './graphql/candidates-dashboard.resolver';
import { TalentPoolResolver } from './graphql/talent-pool.resolver';
import { CandidateReportRepository } from './repositories/candidate-report.repository';
import { CandidatesDashboardRepository } from './repositories/candidates-dashboard.repository';
import { TalentPoolRepository } from './repositories/talent-pool.repository';
import { CandidateReportService } from './services/candidate-report.service';
import { CandidatesDashboardService } from './services/candidates-dashboard.service';
import { TalentPoolService } from './services/talent-pool.service';

@Module({
  imports: [AuthModule, AiEvaluationModule],
  providers: [
    CandidatesDashboardRepository,
    CandidateReportRepository,
    TalentPoolRepository,
    CandidatesDashboardService,
    CandidateReportService,
    TalentPoolService,
    CandidatesDashboardResolver,
    CandidateReportResolver,
    TalentPoolResolver,
  ],
  exports: [CandidatesDashboardService],
})
export class CandidatesModule {}
