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
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ShortlistModule } from './modules/shortlist/shortlist.module';
import { InterviewCoreModule } from './modules/interview-core/interview-core.module';
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
    InterviewCoreModule,
    AiEvaluationModule,
    UsageLoggingModule,
    InterviewsModule,
    CandidatesModule,
    AnalyticsModule,
    ShortlistModule,
    AppGraphQLModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
