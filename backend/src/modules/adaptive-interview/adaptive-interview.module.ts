import { Module, forwardRef } from '@nestjs/common';
import { AiProviderModule } from '../ai-provider/ai-provider.module';
import { RedisModule } from '../../common/redis/redis.module';
import { InterviewCoreModule } from '../interview-core/interview-core.module';
import { InterviewRealtimeModule } from '../interview-realtime/interview-realtime.module';
import { MediaModule } from '../media/media.module';
import { UsageLoggingModule } from '../usage-logging/usage-logging.module';
import { FollowUpRepository } from './repositories/follow-up.repository';
import { CheckpointStateRepository } from './repositories/checkpoint-state.repository';
import { QuestionSummaryRepository } from './repositories/question-summary.repository';
import { AdaptiveInterviewContextService } from './services/adaptive-interview-context.service';
import { AdaptiveAiConversationService } from './services/adaptive-ai-conversation.service';
import { AdaptiveOpenAiResponseStateService } from './services/adaptive-openai-response-state.service';
import { AdaptiveInterviewSubmitService } from './services/adaptive-interview-submit.service';
import { CheckpointStateService } from './services/checkpoint-state.service';
import { FollowUpPlannerService } from './services/follow-up-planner.service';
import { MainQuestionOpenerService } from './services/main-question-opener.service';
import { TopicOpenerScoringGateService } from './services/topic-opener-scoring-gate.service';
import { FollowUpPlannerValidatorService } from './services/follow-up-planner-validator.service';
import { FollowUpPolicyService } from './services/follow-up-policy.service';
import { PerTurnCheckpointEvaluatorService } from './services/per-turn-checkpoint-evaluator.service';
import { PerTurnEvaluationValidatorService } from './services/per-turn-evaluation-validator.service';
import { CandidateTurnClassifierValidatorService } from './services/candidate-turn-classifier-validator.service';
import { CandidateTurnClassifierService } from './services/candidate-turn-classifier.service';
import { QuestionSummaryService } from './services/question-summary.service';

@Module({
  imports: [
    RedisModule,
    AiProviderModule,
    forwardRef(() => InterviewCoreModule),
    forwardRef(() => InterviewRealtimeModule),
    MediaModule,
    UsageLoggingModule,
  ],
  providers: [
    CheckpointStateRepository,
    FollowUpRepository,
    QuestionSummaryRepository,
    CheckpointStateService,
    AdaptiveInterviewContextService,
    AdaptiveAiConversationService,
    AdaptiveOpenAiResponseStateService,
    PerTurnEvaluationValidatorService,
    CandidateTurnClassifierValidatorService,
    CandidateTurnClassifierService,
    PerTurnCheckpointEvaluatorService,
    FollowUpPolicyService,
    FollowUpPlannerValidatorService,
    FollowUpPlannerService,
    MainQuestionOpenerService,
    TopicOpenerScoringGateService,
    AdaptiveInterviewSubmitService,
    QuestionSummaryService,
  ],
  exports: [
    CheckpointStateService,
    CheckpointStateRepository,
    FollowUpRepository,
    QuestionSummaryRepository,
    AdaptiveInterviewContextService,
    AdaptiveAiConversationService,
    AdaptiveOpenAiResponseStateService,
    PerTurnCheckpointEvaluatorService,
    PerTurnEvaluationValidatorService,
    CandidateTurnClassifierValidatorService,
    CandidateTurnClassifierService,
    FollowUpPolicyService,
    FollowUpPlannerService,
    FollowUpPlannerValidatorService,
    MainQuestionOpenerService,
    TopicOpenerScoringGateService,
    AdaptiveInterviewSubmitService,
    QuestionSummaryService,
  ],
})
export class AdaptiveInterviewModule {}
