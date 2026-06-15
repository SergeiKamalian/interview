export const ADAPTIVE_INTERVIEW_CONTEXT_DEFAULTS = {
  localTurnLimit: 10,
  maxFollowUpsPerQuestion: 10,
  maxFollowUpsPerCheckpoint: 1,
  maxTextLength: 500,
  maxReferenceAnswerLength: 600,
  /** 1.0 = probe all checkpoints unless already covered; no early stop at partial total score */
  questionScoreSufficientRatio: 1,
  lowWeightCheckpointRatio: 0.2,
} as const;

export type AdaptiveInterviewContextLimits = {
  localTurnLimit: number;
  maxFollowUpsPerQuestion: number;
  maxFollowUpsPerCheckpoint: number;
  maxTextLength: number;
  maxReferenceAnswerLength: number;
  questionScoreSufficientRatio: number;
  lowWeightCheckpointRatio: number;
};

export function isAdaptiveInterviewEnabled(): boolean {
  return readBooleanFlag(process.env.ADAPTIVE_INTERVIEW_ENABLED, false);
}

export function isFollowUpLlmEnabled(): boolean {
  return readBooleanFlag(process.env.ADAPTIVE_FOLLOW_UP_USE_LLM, true);
}

/** Reuse Redis chat history per question — bootstrap context once, incremental turns after. */
export function isAdaptiveAiConversationSessionEnabled(): boolean {
  return readBooleanFlag(process.env.ADAPTIVE_AI_CONVERSATION_SESSION, true);
}

/** Single LLM call: evaluate checkpoints + suggest follow-up (skips second planner call when valid). */
export function isAdaptiveAiCombinedTurnEnabled(): boolean {
  return readBooleanFlag(process.env.ADAPTIVE_AI_COMBINED_TURN, true);
}

export function getAdaptiveAiConversationSessionTtlSeconds(): number {
  return readPositiveInt(
    process.env.ADAPTIVE_AI_CONVERSATION_TTL_SECONDS,
    86_400,
  );
}

export function getAdaptiveInterviewContextLimits(): AdaptiveInterviewContextLimits {
  return {
    localTurnLimit: readPositiveInt(
      process.env.ADAPTIVE_LOCAL_TURN_LIMIT,
      ADAPTIVE_INTERVIEW_CONTEXT_DEFAULTS.localTurnLimit,
    ),
    maxFollowUpsPerQuestion: readPositiveInt(
      process.env.ADAPTIVE_MAX_FOLLOW_UPS_PER_QUESTION,
      ADAPTIVE_INTERVIEW_CONTEXT_DEFAULTS.maxFollowUpsPerQuestion,
    ),
    maxFollowUpsPerCheckpoint: readPositiveInt(
      process.env.ADAPTIVE_MAX_FOLLOW_UPS_PER_CHECKPOINT,
      ADAPTIVE_INTERVIEW_CONTEXT_DEFAULTS.maxFollowUpsPerCheckpoint,
    ),
    maxTextLength: ADAPTIVE_INTERVIEW_CONTEXT_DEFAULTS.maxTextLength,
    maxReferenceAnswerLength:
      ADAPTIVE_INTERVIEW_CONTEXT_DEFAULTS.maxReferenceAnswerLength,
    questionScoreSufficientRatio: readPositiveFloat(
      process.env.ADAPTIVE_QUESTION_SCORE_SUFFICIENT_RATIO,
      ADAPTIVE_INTERVIEW_CONTEXT_DEFAULTS.questionScoreSufficientRatio,
    ),
    lowWeightCheckpointRatio: readPositiveFloat(
      process.env.ADAPTIVE_LOW_WEIGHT_CHECKPOINT_RATIO,
      ADAPTIVE_INTERVIEW_CONTEXT_DEFAULTS.lowWeightCheckpointRatio,
    ),
  };
}

function readBooleanFlag(
  value: string | undefined,
  fallback: boolean,
): boolean {
  if (value === undefined || value.trim() === '') {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
}

function readPositiveFloat(
  value: string | undefined,
  fallback: number,
): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 1) {
    return fallback;
  }

  return parsed;
}

function readPositiveInt(
  value: string | undefined,
  fallback: number,
): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}
