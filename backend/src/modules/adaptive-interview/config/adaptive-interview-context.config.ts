export const ADAPTIVE_INTERVIEW_CONTEXT_DEFAULTS = {
  localTurnLimit: 10,
  /** 4 allows one depth probe on heavy checkpoint + residual/narrowing without early exhaustion */
  maxFollowUpsPerQuestion: 4,
  maxFollowUpsPerCheckpoint: 1,
  maxFollowUpsHeavyCheckpoint: 2,
  heavyCheckpointWeightRatio: 0.2,
  minPriorityToProbe: 0.15,
  maxTextLength: 500,
  maxReferenceAnswerLength: 600,
  /** 0.85 = stop follow-ups when question score is sufficient */
  questionScoreSufficientRatio: 0.85,
  lowWeightCheckpointRatio: 0.2,
} as const;

export type AdaptiveInterviewContextLimits = {
  localTurnLimit: number;
  maxFollowUpsPerQuestion: number;
  maxFollowUpsPerCheckpoint: number;
  maxFollowUpsHeavyCheckpoint: number;
  heavyCheckpointWeightRatio: number;
  minPriorityToProbe: number;
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

/** Last-resort regex intent when CandidateTurnClassifier AI is unavailable. Default off. */
export function isClassifierRegexEmergencyFallbackEnabled(): boolean {
  return readBooleanFlag(process.env.CLASSIFIER_REGEX_EMERGENCY_FALLBACK, false);
}

/** Legacy Chat Completions fallback: keeps Redis messages and sends full chat history. */
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

/** Recommended default: use OpenAI Responses API for adaptive evaluate_turn. */
export function isAdaptiveAiOpenAiResponsesApiEnabled(): boolean {
  return readBooleanFlag(process.env.ADAPTIVE_AI_OPENAI_RESPONSES_API, true);
}

/** Store previous_response_id in Redis and send only incremental turns to OpenAI. */
export function isAdaptiveAiOpenAiServerStateEnabled(): boolean {
  return readBooleanFlag(process.env.ADAPTIVE_AI_OPENAI_SERVER_STATE, true);
}

/** Retry once through the existing Chat Completions path if server-side state fails. */
export function isAdaptiveAiOpenAiServerStateFallbackEnabled(): boolean {
  return readBooleanFlag(
    process.env.ADAPTIVE_AI_OPENAI_SERVER_STATE_FALLBACK,
    true,
  );
}

export function getAdaptiveAiOpenAiStateTtlSeconds(): number {
  return readPositiveInt(
    process.env.ADAPTIVE_AI_OPENAI_STATE_TTL_SECONDS,
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
    maxFollowUpsHeavyCheckpoint: readNonNegativeInt(
      process.env.ADAPTIVE_MAX_FOLLOW_UPS_HEAVY_CHECKPOINT,
      ADAPTIVE_INTERVIEW_CONTEXT_DEFAULTS.maxFollowUpsHeavyCheckpoint,
    ),
    heavyCheckpointWeightRatio: readPositiveFloat(
      process.env.ADAPTIVE_HEAVY_CHECKPOINT_WEIGHT_RATIO,
      ADAPTIVE_INTERVIEW_CONTEXT_DEFAULTS.heavyCheckpointWeightRatio,
    ),
    minPriorityToProbe: readMinPriority(
      process.env.ADAPTIVE_MIN_PRIORITY_TO_PROBE,
      ADAPTIVE_INTERVIEW_CONTEXT_DEFAULTS.minPriorityToProbe,
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

function readPositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function readNonNegativeInt(
  value: string | undefined,
  fallback: number,
): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
}

function readMinPriority(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    return fallback;
  }

  return parsed;
}
