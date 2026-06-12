import { Module } from '@nestjs/common';
import { AppConfigModule } from './common/config/config.module';
import { AppGraphQLModule } from './modules/graphql/graphql.module';
import { HealthModule } from './modules/health/health.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [AppConfigModule, HealthModule, AppGraphQLModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
