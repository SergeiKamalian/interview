import type { AdaptiveAiSuggestedFollowUp } from '../types/adaptive-ai-conversation.types';
import type { PerTurnSuggestedFollowUpJson } from '../types/per-turn-evaluation.types';

export function parseSuggestedFollowUpFromJson(
  raw: unknown,
): AdaptiveAiSuggestedFollowUp | null {
  if (raw === null || raw === undefined) {
    return null;
  }

  if (typeof raw !== 'object') {
    return null;
  }

  const payload = raw as Partial<PerTurnSuggestedFollowUpJson>;
  const checkpointKey = payload.checkpoint_key?.trim();
  const followUpQuestion = payload.follow_up_question?.trim();
  const reason = payload.reason?.trim();

  if (!checkpointKey || !followUpQuestion || !reason) {
    return null;
  }

  return {
    checkpointKey,
    followUpQuestion,
    reason,
  };
}

export function isSuggestedFollowUpUsable(
  suggested: AdaptiveAiSuggestedFollowUp | null | undefined,
  targetCheckpointKey: string,
): suggested is AdaptiveAiSuggestedFollowUp {
  return (
    suggested !== null &&
    suggested !== undefined &&
    suggested.checkpointKey === targetCheckpointKey &&
    suggested.followUpQuestion.trim().length > 0
  );
}
