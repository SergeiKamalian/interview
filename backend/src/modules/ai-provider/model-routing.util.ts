import type { AiConfig } from '../../common/config/ai.schema';

/**
 * Logical LLM roles in the evaluation pipeline. Each role maps to one model
 * resolved from config. `evaluation` is the default/strong model and the
 * fallback for any unknown operation type.
 */
export type AiModelRole =
  | 'evaluation'
  | 'classifier'
  | 'followUp'
  | 'voice'
  | 'final';

/** Resolved model strings per role, derived from {@link AiConfig}. */
export type AiRoleModels = Record<AiModelRole, string>;

/**
 * Maps a debug/usage `operationType` to the logical role that should run it.
 * Any operation type not listed here falls back to the `evaluation` role,
 * which itself defaults to `AI_MODEL_EVALUATION`.
 */
export const OPERATION_TYPE_TO_ROLE: Readonly<Record<string, AiModelRole>> = {
  // Strong / reasoning model: checkpoint evaluation + final summary.
  evaluate_turn: 'evaluation',
  evaluate_turn_prewarm: 'evaluation',
  evaluate_answer: 'evaluation',
  final_evaluation: 'final',
  final_summary: 'final',
  // Cheap / fast model: classification + scoring gate.
  candidate_turn_classifier: 'classifier',
  topic_opener_scoring_gate: 'classifier',
  // Cheap / fast model: follow-up planning.
  plan_follow_up: 'followUp',
  follow_up_planner: 'followUp',
  // Cheap / fast model: interviewer voice / opener generation.
  main_question_opener: 'voice',
  main_question_reveal: 'voice',
};

/** Builds the per-role model lookup table from the AI config. */
export function buildAiRoleModels(config: AiConfig): AiRoleModels {
  return {
    evaluation: config.modelEvaluation,
    classifier: config.modelClassifier,
    followUp: config.modelFollowUp,
    voice: config.modelVoice,
    final: config.modelFinal,
  };
}

/**
 * Resolves the model for a given operation type. Unknown or missing operation
 * types fall back to the evaluation model, so omitting all per-role env vars
 * keeps behavior byte-for-byte identical to the single-model setup.
 */
export function resolveModelForOperation(
  operationType: string | undefined,
  models: AiRoleModels,
): string {
  const role = operationType
    ? OPERATION_TYPE_TO_ROLE[operationType]
    : undefined;
  return models[role ?? 'evaluation'];
}
