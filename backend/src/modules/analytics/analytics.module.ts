import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AiCostResolver } from './graphql/ai-cost.resolver';
import { TopicSkillQuestionResolver } from './graphql/topic-skill-question.resolver';
import { AiCostRepository } from './repositories/ai-cost.repository';
import { TopicSkillQuestionRepository } from './repositories/topic-skill-question.repository';
import { AiCostService } from './services/ai-cost.service';
import { TopicSkillQuestionService } from './services/topic-skill-question.service';

@Module({
  imports: [AuthModule],
  providers: [
    TopicSkillQuestionRepository,
    AiCostRepository,
    TopicSkillQuestionService,
    AiCostService,
    TopicSkillQuestionResolver,
    AiCostResolver,
  ],
})
export class AnalyticsModule {}
