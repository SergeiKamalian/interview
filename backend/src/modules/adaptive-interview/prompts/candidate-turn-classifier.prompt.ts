import type { CandidateTurnClassifierInput } from '../types/candidate-turn-classifier.types';

export const CANDIDATE_TURN_CLASSIFIER_PROMPT_KEY = 'candidate_turn_classifier';
export const CANDIDATE_TURN_CLASSIFIER_PROMPT_VERSION = '1.0.0';

const RESPONSE_JSON_SCHEMA = `{
  "turn_kind": "substantive_answer | scope_clarification | format_clarification | decline_whole | decline_scoped | topic_refusal | confused | off_topic",
  "confidence": "high | low",
  "reason": "one sentence in Russian explaining the classification",
  "opener_readiness": "ready | uncertain | declined | null (only when message_kind=topic_opener_answer)"
}`;

export function buildCandidateTurnClassifierSystemPrompt(): string {
  return [
    'You classify the candidate latest message in a live technical interview.',
    'You do NOT score knowledge. You do NOT judge correctness.',
    'You only decide what the candidate is DOING with this message.',
    '',
    'Core rules:',
    '- Read the latest message IN CONTEXT of the last interviewer message and message_kind.',
    '- Paraphrases and informal Russian/English count. Never keyword matching.',
    '- If the candidate adds ANY technical explanation (even wrong) -> substantive_answer, NOT scope_clarification.',
    '- scope_clarification = meta only about WHAT was asked, with NO new technical evidence.',
    '- format_clarification = meta only about HOW to answer (brief/detailed), not WHAT topic.',
    '- decline_scoped = refuses ONE aspect of a follow-up; decline_whole = refuses the entire main question.',
    '- topic_refusal = asks to skip/move on from the current probe sub-topic.',
    '- confused = does not understand the question (vague), without naming a specific scope alternative.',
    '- misunderstood_question is NOT your job; wrong-topic substantive answers are still substantive_answer.',
    '',
    'turn_kind guide:',
    '',
    'substantive_answer:',
    '- Candidate adds technical content: explains, describes mechanism, gives example, tries to answer.',
    '- Includes wrong answers, partial answers, uncertain attempts with substance.',
    '- Confirmation PLUS explanation -> substantive_answer (e.g. "scheduler uses MessageChannel, right?").',
    '- Long answer ending with "?" -> substantive_answer if body has technical content.',
    '',
    'scope_clarification:',
    '- ONLY meta: asks what you mean, which topic, confirms scope without explaining.',
    '- Examples: "What exactly?", "You mean useEffect or useState?", "So it is about scheduler inside Fiber?"',
    '- Repeating your follow-up without new facts -> scope_clarification.',
    '',
    'format_clarification:',
    '- Asks HOW to answer: brief/detailed, high-level/in depth.',
    '- Examples: "Short or detailed?", "Brief or with details?"',
    '',
    'decline_whole:',
    '- Refuses the entire main question or says they do not know the topic at all.',
    '- Examples: "I do not know", "No idea", "Nothing about this topic".',
    '',
    'decline_scoped:',
    '- Refuses only the current follow-up aspect, not the whole question.',
    '- Examples: "I cannot answer about lanes", "Not sure about deferred updates specifically".',
    '',
    'topic_refusal:',
    '- Wants to skip the current sub-topic or move on.',
    '- Examples: "Let us move on", "Better not touch this part", "I will not say about lanes".',
    '',
    'confused:',
    '- Says they do not understand the question generally, asks to rephrase.',
    '- NOT scope_clarification unless they name a specific alternative ("X or Y?").',
    '',
    'off_topic:',
    '- Unrelated to the interview question; nonsense; empty engagement.',
    '',
    'topic_opener_answer (message_kind=topic_opener_answer):',
    '- Also set opener_readiness: ready (confident familiarity), uncertain (heard only / weak), declined (does not know topic).',
    '- "Worked with it in projects" -> substantive_answer + opener_readiness=ready.',
    '- "Only heard, not used" -> substantive_answer + opener_readiness=uncertain.',
    '- "Do not know this topic" -> decline_whole + opener_readiness=declined.',
    '',
    'confidence:',
    '- high: clear classification from context.',
    '- low: ambiguous; prefer substantive_answer when any technical content is present.',
    '',
    'Return valid JSON only, no markdown fences:',
    RESPONSE_JSON_SCHEMA,
  ].join('\n');
}

export function buildCandidateTurnClassifierUserPrompt(
  input: CandidateTurnClassifierInput,
): string {
  const lines = [
    `message_kind: ${input.messageKind}`,
    '',
    'Main question:',
    input.mainQuestionText.trim() || '(none)',
    '',
    'Last interviewer message:',
    input.lastInterviewerMessage?.trim() || '(none)',
  ];

  if (input.targetCheckpointTitle?.trim()) {
    lines.push('', 'Target checkpoint:', input.targetCheckpointTitle.trim());
  }

  if (input.targetCheckpointKey?.trim()) {
    lines.push(`target_checkpoint_key: ${input.targetCheckpointKey.trim()}`);
  }

  const recentTurns = (input.localTurns ?? []).slice(-4);
  if (recentTurns.length > 0) {
    lines.push('', 'Recent dialogue:');
    for (const turn of recentTurns) {
      const role = turn.role === 'ai' ? 'Interviewer' : 'Candidate';
      lines.push(`${role}: ${turn.content.trim()}`);
    }
  }

  lines.push(
    '',
    'Latest candidate message:',
    input.candidateAnswer.trim() || '(empty)',
    '',
    'Decision checklist:',
    '1. NEW technical content? -> substantive_answer',
    '2. ONLY what you meant / which topic? -> scope_clarification',
    '3. ONLY how to answer (brief/detailed)? -> format_clarification',
    '4. Refuses entire question? -> decline_whole',
    '5. Refuses only this follow-up aspect? -> decline_scoped or topic_refusal',
    '6. Does not understand question (vague)? -> confused',
    '7. Unrelated? -> off_topic',
    '',
    'Classify now.',
  );

  return lines.join('\n');
}
