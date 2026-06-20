import { Module } from '@nestjs/common';
import { AiEvaluationModule } from '../ai-evaluation/ai-evaluation.module';
import { AuthModule } from '../auth/auth.module';
import { CandidateReportResolver } from './graphql/candidate-report.resolver';
import { CandidatesDashboardResolver } from './graphql/candidates-dashboard.resolver';
import { CompanyReviewQueueResolver } from './graphql/company-review-queue.resolver';
import { TalentPoolResolver } from './graphql/talent-pool.resolver';
import { CandidateReportRepository } from './repositories/candidate-report.repository';
import { CandidatesDashboardRepository } from './repositories/candidates-dashboard.repository';
import { CompanyReviewQueueRepository } from './repositories/company-review-queue.repository';
import { TalentPoolRepository } from './repositories/talent-pool.repository';
import { CandidateReportService } from './services/candidate-report.service';
import { CandidatesDashboardService } from './services/candidates-dashboard.service';
import { CompanyReviewQueueService } from './services/company-review-queue.service';
import { TalentPoolService } from './services/talent-pool.service';

@Module({
  imports: [AuthModule, AiEvaluationModule],
  providers: [
    CandidatesDashboardRepository,
    CandidateReportRepository,
    CompanyReviewQueueRepository,
    TalentPoolRepository,
    CandidatesDashboardService,
    CandidateReportService,
    CompanyReviewQueueService,
    TalentPoolService,
    CandidatesDashboardResolver,
    CandidateReportResolver,
    CompanyReviewQueueResolver,
    TalentPoolResolver,
  ],
  exports: [CandidatesDashboardService],
})
export class CandidatesModule {}
