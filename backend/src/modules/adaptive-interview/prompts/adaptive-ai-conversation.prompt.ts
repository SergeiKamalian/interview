import type { AdaptiveInterviewContextPacket } from '../types/adaptive-interview-context.types';
import {
  INTERVIEWER_FIRST_PERSON_VOICE_RULES,
  INTERVIEWER_FOLLOW_UP_REMINDER,
} from './interviewer-voice.prompt';
import {
  buildPerTurnCheckpointEvaluationSystemPrompt,
  PER_TURN_CHECKPOINT_EVALUATION_PROMPT_VERSION,
} from './per-turn-checkpoint-evaluation.prompt';

export const ADAPTIVE_AI_CONVERSATION_EVALUATE_PROMPT_VERSION = `conv-${PER_TURN_CHECKPOINT_EVALUATION_PROMPT_VERSION}-combined-v3`;

const COMBINED_FOLLOW_UP_SCHEMA = `Optional field when combined mode is on:
  "suggested_follow_up": {
    "checkpoint_key": "key of the highest-priority checkpoint that still needs clarification",
    "follow_up_question": "MANDATORY: interviewer «я» speaking to candidate «вы» — varied short opener (not «Понял, спасибо» every time) or none, then ONE direct question in Russian; never third person, never rubric/checkpoint labels, never quote the candidate's words",
    "reason": "why this follow-up helps"
  } | null
  — set null if all checkpoints are covered, candidate declined/confused whole question, or no follow-up needed.`;

export function buildEvaluateConversationSystemPrompt(
  combinedTurn: boolean,
): string {
  const base = buildPerTurnCheckpointEvaluationSystemPrompt();

  return [
    base,
    '',
    'Conversation mode:',
    '- The first user message establishes immutable interview context for this question.',
    '- Each later user message is only a new candidate turn — do NOT ask to repeat full context.',
    '- Use conversation history plus the latest turn; scores are cumulative and must never decrease.',
    '- Cumulative does not mean lenient: do not increase scores for keyword mentions that are false or semantically wrong.',
    combinedTurn
      ? [
          COMBINED_FOLLOW_UP_SCHEMA,
          '',
          'When writing suggested_follow_up.follow_up_question:',
          INTERVIEWER_FIRST_PERSON_VOICE_RULES,
        ].join('\n')
      : '- Do not suggest follow-up questions in this response.',
  ].join('\n');
}

export function buildEvaluateConversationBootstrapUserPrompt(
  context: AdaptiveInterviewContextPacket,
): string {
  const checkpointBlock = context.checkpoints
    .map((checkpoint, index) =>
      [
        `${index + 1}. key=${checkpoint.checkpointKey}`,
        `   title=${checkpoint.title}`,
        `   expected=${checkpoint.expected}`,
        `   max_score=${checkpoint.score}`,
      ].join('\n'),
    )
    .join('\n\n');

  return [
    'Establish interview context for this question (keep for all later turns in this session):',
    '',
    'Question:',
    context.questionText,
    '',
    'Reference answer (short, not strict match):',
    context.referenceAnswer,
    '',
    'Checkpoints (source of truth — keys are fixed for this session):',
    checkpointBlock,
    '',
    'Acknowledge briefly, then wait for candidate answers.',
  ].join('\n');
}

export function buildEvaluateConversationTurnUserPrompt(
  context: AdaptiveInterviewContextPacket,
  combinedTurn: boolean,
): string {
  const stateBlock =
    context.checkpointStates.length === 0
      ? '(none yet)'
      : context.checkpointStates
          .map(
            (state) =>
              `- ${state.checkpointKey}: status=${state.status}, score=${state.scoreAwarded}/${state.maxScore}`,
          )
          .join('\n');

  const lines = [
    'New candidate answer to evaluate:',
    context.latestCandidateAnswer || '(empty)',
    '',
    'Current checkpoint states (never decrease scores below these):',
    stateBlock,
    '',
    `Return JSON with candidate_disposition and exactly ${context.checkpoints.length} checkpoint_results.`,
    'Use checkpoint_key values from the established session context.',
  ];

  if (combinedTurn) {
    lines.push(
      '',
      'Also include suggested_follow_up for the best checkpoint to clarify next, or null if none.',
      INTERVIEWER_FOLLOW_UP_REMINDER,
    );
  }

  return lines.join('\n');
}

export function buildEvaluateConversationBootstrapPrewarmUserPrompt(
  context: AdaptiveInterviewContextPacket,
  combinedTurn: boolean,
): string {
  return [
    buildEvaluateConversationBootstrapUserPrompt(context),
    '',
    'Prewarm only: no candidate answer has been submitted yet.',
    'Return valid JSON now so this Responses API state can be continued later.',
    'Set candidate_disposition to "engaged".',
    'Return exactly one checkpoint_result per checkpoint from the established context.',
    'For every checkpoint_result set status="missed", score_awarded=0, confidence=1, evidence_summary=null, rationale="No candidate answer yet."',
    combinedTurn ? 'Set suggested_follow_up to null.' : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildEvaluateConversationBootstrapAssistantAck(): string {
  return 'Context loaded. Send each new candidate answer; I will return evaluation JSON for all checkpoints.';
}
