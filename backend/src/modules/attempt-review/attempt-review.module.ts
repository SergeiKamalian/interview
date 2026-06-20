import { Module } from '@nestjs/common';
import { AiEvaluationModule } from '../ai-evaluation/ai-evaluation.module';
import { AuthModule } from '../auth/auth.module';
import { AttemptSharePublicController } from './controllers/attempt-share-public.controller';
import { AttemptReviewResolver } from './graphql/attempt-review.resolver';
import { AttemptReviewNotesRepository } from './repositories/attempt-review-notes.repository';
import { AttemptReviewRepository } from './repositories/attempt-review.repository';
import { AttemptShareRepository } from './repositories/attempt-share.repository';
import { AttemptReviewService } from './services/attempt-review.service';
import { AttemptShareService } from './services/attempt-share.service';

@Module({
  imports: [AuthModule, AiEvaluationModule],
  controllers: [AttemptSharePublicController],
  providers: [
    AttemptReviewRepository,
    AttemptReviewNotesRepository,
    AttemptShareRepository,
    AttemptReviewService,
    AttemptShareService,
    AttemptReviewResolver,
  ],
  exports: [
    AttemptReviewRepository,
    AttemptReviewNotesRepository,
    AttemptShareRepository,
    AttemptReviewService,
    AttemptShareService,
  ],
})
export class AttemptReviewModule {}
