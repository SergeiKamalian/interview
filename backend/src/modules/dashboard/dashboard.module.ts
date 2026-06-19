import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AuthModule } from '../auth/auth.module';
import { CandidatesModule } from '../candidates/candidates.module';
import { InterviewsModule } from '../interviews/interviews.module';
import { DashboardOverviewResolver } from './graphql/dashboard-overview.resolver';
import { DashboardOverviewRepository } from './repositories/dashboard-overview.repository';
import { DashboardOverviewService } from './services/dashboard-overview.service';

@Module({
  imports: [AuthModule, InterviewsModule, CandidatesModule, AnalyticsModule],
  providers: [
    DashboardOverviewRepository,
    DashboardOverviewService,
    DashboardOverviewResolver,
  ],
})
export class DashboardModule {}
