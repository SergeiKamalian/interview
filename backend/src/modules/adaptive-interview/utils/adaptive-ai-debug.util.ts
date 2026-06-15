import { previewTextFromCommon } from './adaptive-context-debug.util';
import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';

export {
  AdaptiveAiPhaseTimer,
  isAdaptiveAiDebugEnabled,
  logAdaptiveAiDebug,
  startAdaptiveAiPhaseTimer,
  summarizeAiPrompts,
  summarizeChatCompletionBody,
} from '../../../common/debug/adaptive-ai-debug.util';
export type { AdaptiveAiDebugMeta } from '../../../common/debug/adaptive-ai-debug.util';

export function summarizeAdaptiveContextPacket(
  context: AdaptiveInterviewContextPacket,
): Record<string, unknown> {
  return {
    interviewQuestionId: context.interviewQuestionId,
    attemptId: context.attemptId,
    checkpointCount: context.checkpoints.length,
    checkpointKeys: context.checkpoints.map(
      (checkpoint) => checkpoint.checkpointKey,
    ),
    latestCandidateMessageId: context.latestCandidateMessageId,
    latestCandidateAnswerChars: context.latestCandidateAnswer.length,
    latestCandidateAnswerPreview: previewTextFromCommon(
      context.latestCandidateAnswer,
    ),
    localTurnCount: context.localTurns.length,
    evidenceSnippetCount: context.evidenceSnippets.length,
    followUpsUsedForQuestion: context.followUpLimits.usedForQuestion,
    questionTextChars: context.questionText.length,
    referenceAnswerChars: context.referenceAnswer.length,
  };
}
