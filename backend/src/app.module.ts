import { Module } from '@nestjs/common';
import { AppConfigModule } from './common/config/config.module';
import { DatabaseModule } from './common/database/database.module';
import { AppLoggerModule } from './common/logger/logger.module';
import { RedisModule } from './common/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { AiEvaluationModule } from './modules/ai-evaluation/ai-evaluation.module';
import { AiProviderModule } from './modules/ai-provider/ai-provider.module';
import { UsageLoggingModule } from './modules/usage-logging/usage-logging.module';
import { InterviewsModule } from './modules/interviews/interviews.module';
import { CandidatesModule } from './modules/candidates/candidates.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ShortlistModule } from './modules/shortlist/shortlist.module';
import { InterviewCoreModule } from './modules/interview-core/interview-core.module';
import { InterviewTemplatesModule } from './modules/interview-templates/interview-templates.module';
import { InterviewRealtimeModule } from './modules/interview-realtime/interview-realtime.module';
import { MediaModule } from './modules/media/media.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { AdaptiveInterviewModule } from './modules/adaptive-interview/adaptive-interview.module';
import { QuestionBankModule } from './modules/question-bank/question-bank.module';
import { AppGraphQLModule } from './modules/graphql/graphql.module';
import { HealthModule } from './modules/health/health.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    AppConfigModule,
    AiProviderModule,
    AppLoggerModule,
    DatabaseModule,
    RedisModule,
    HealthModule,
    AuthModule,
    QuestionBankModule,
    AdaptiveInterviewModule,
    InterviewRealtimeModule,
    MediaModule,
    UploadsModule,
    InterviewCoreModule,
    InterviewTemplatesModule,
    AiEvaluationModule,
    UsageLoggingModule,
    InterviewsModule,
    CandidatesModule,
    AnalyticsModule,
    DashboardModule,
    ShortlistModule,
    AppGraphQLModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
