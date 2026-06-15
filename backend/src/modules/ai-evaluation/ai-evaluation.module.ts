import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdaptiveInterviewModule } from '../adaptive-interview/adaptive-interview.module';
import { InterviewCoreModule } from '../interview-core/interview-core.module';
import { ScoringModule } from '../scoring/scoring.module';
import { UsageLoggingModule } from '../usage-logging/usage-logging.module';
import { AiEvaluationResolver } from './ai-evaluation.resolver';
import { CheckpointResultsResolver } from './graphql/checkpoint-results.resolver';
import { CheckpointResultRepository } from './repositories/checkpoint-result.repository';
import { FinalEvaluationRepository } from './repositories/final-evaluation.repository';
import { QuestionEvaluationRepository } from './repositories/question-evaluation.repository';
import { AdaptiveEvidenceEvaluationService } from './services/adaptive-evidence-evaluation.service';
import { AiEvaluationService } from './services/ai-evaluation.service';
import { AiResponseValidatorService } from './services/ai-response-validator.service';
import { CheckpointEvaluationService } from './services/checkpoint-evaluation.service';
import { EvaluationContextService } from './services/evaluation-context.service';
import { FinalEvaluationService } from './services/final-evaluation.service';
import { HallucinationGuardService } from './services/hallucination-guard.service';
import { CheckpointResultsService } from './services/checkpoint-results.service';

@Module({
  imports: [
    AuthModule,
    forwardRef(() => InterviewCoreModule),
    forwardRef(() => AdaptiveInterviewModule),
    ScoringModule,
    UsageLoggingModule,
  ],
  providers: [
    EvaluationContextService,
    AiResponseValidatorService,
    CheckpointEvaluationService,
    HallucinationGuardService,
    QuestionEvaluationRepository,
    CheckpointResultRepository,
    FinalEvaluationRepository,
    FinalEvaluationService,
    AdaptiveEvidenceEvaluationService,
    AiEvaluationService,
    CheckpointResultsService,
    AiEvaluationResolver,
    CheckpointResultsResolver,
  ],
  exports: [
    CheckpointEvaluationService,
    EvaluationContextService,
    AiResponseValidatorService,
    QuestionEvaluationRepository,
    CheckpointResultRepository,
    FinalEvaluationRepository,
    FinalEvaluationService,
    AdaptiveEvidenceEvaluationService,
    AiEvaluationService,
  ],
})
export class AiEvaluationModule {}
