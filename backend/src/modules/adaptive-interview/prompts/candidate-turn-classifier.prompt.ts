import type { CandidateTurnClassifierInput } from '../types/candidate-turn-classifier.types';

export const CANDIDATE_TURN_CLASSIFIER_PROMPT_KEY = 'candidate_turn_classifier';
export const CANDIDATE_TURN_CLASSIFIER_PROMPT_VERSION = '1.1.0';

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
    '=== STEP 0 (MANDATORY): speech act — who is speaking to whom? ===',
    '',
    'Before any technical analysis, decide the SPEECH ACT:',
    '',
    'A) Candidate speaks TO the interviewer (meta / dialogue):',
    '   - asks the interviewer a question',
    '   - asks to clarify what the interviewer meant',
    '   - confirms scope without explaining ("you mean X?", "X or Y?")',
    '   - asks how to format the answer (brief vs detailed)',
    '   - says they cannot / will not answer (refusal)',
    '   - says they do not understand and need rephrase',
    '   => NEVER substantive_answer for speech act A.',
    '',
    'B) Candidate explains TO the interviewer (substantive):',
    '   - states facts, mechanisms, steps, examples',
    '   - tries to answer the question (correct or wrong)',
    '   - adds new technical claims or descriptions',
    '   => substantive_answer (or decline/off_topic if refusing/unrelated).',
    '',
    'CRITICAL — technical words alone do NOT make substantive_answer:',
    '- If the candidate only NAMES terms inside a question to the interviewer -> speech act A.',
    '- Example META (scope): "You mean MessageChannel/postMessage or shouldYield and 5ms?" — asks, does not explain.',
    '- Example META (scope): "Which details exactly?" after a vague interviewer probe — asks back, does not explain.',
    '- Example SUBSTANTIVE: "Scheduler uses MessageChannel and postMessage to schedule the work loop" — explains.',
    '- A "?" at the end does NOT automatically mean meta; but a message that ONLY asks the interviewer is always meta.',
    '',
    'Never use phrase matching or keyword lists. Understand intent from dialogue context.',
    '',
    '=== STEP 1: pick turn_kind (only after STEP 0) ===',
    '',
    'substantive_answer (speech act B only):',
    '- Candidate explains, describes a mechanism, gives an example, attempts an answer.',
    '- Wrong, partial, or uncertain answers with real technical content.',
    '- Confirmation PLUS added explanation -> substantive_answer.',
    '  ("Scheduler uses MessageChannel, right? And it yields every 5ms" = explains + confirms)',
    '- Confirmation WITHOUT any explanation -> scope_clarification, NOT substantive.',
    '',
    'scope_clarification (speech act A — WHAT topic/scope):',
    '- Asks what you meant, which sub-topic, or offers alternatives ("X or Y?").',
    '- Confirms scope without teaching: "So you mean scheduler inside Fiber?"',
    '- Echoes your follow-up as a question back to you.',
    '- Technical terms may appear — they disambiguate your question, not answer it.',
    '',
    'format_clarification (speech act A — HOW to answer):',
    '- Brief vs detailed, high-level vs in depth, "on fingers" vs with details.',
    '',
    'decline_whole (speech act A — refuses entire main question):',
    '- Refuses the whole topic; no willingness to try.',
    '- Judge by meaning (cannot answer this question at all), not by specific phrases.',
    '',
    'decline_scoped (speech act A — refuses one aspect):',
    '- Refuses only the current follow-up slice, may still answer other parts.',
    '',
    'topic_refusal (speech act A — skip this sub-topic):',
    '- Wants to move on from the current probe only.',
    '',
    'confused (speech act A — does not understand):',
    '- Cannot parse the interviewer question; asks to rephrase in general.',
    '- Vague "what do you mean?" without naming alternatives -> confused OR scope_clarification;',
    '  prefer scope_clarification if they point at a concrete ambiguity in your last message.',
    '',
    'off_topic:',
    '- Unrelated content, nonsense, empty message.',
    '',
    'misunderstood_question is NOT your job — wrong-topic substantive attempts stay substantive_answer.',
    '',
    'topic_opener_answer (message_kind=topic_opener_answer):',
    '- Also set opener_readiness: ready | uncertain | declined | null.',
    '- Familiarity statement without explaining Fiber -> substantive_answer + opener_readiness.',
    '- Does not know the topic at all -> decline_whole + opener_readiness=declined.',
    '',
    'confidence:',
    '- high: speech act is clear.',
    '- low: ambiguous — if speech act A, prefer scope/format/confused over substantive_answer;',
    '  never upgrade a meta question to substantive_answer because of technical nouns.',
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
    'Decision checklist (strict order):',
    '0. Speech act: candidate asks YOU (meta) or explains to YOU (substantive)?',
    '   - If meta -> NEVER substantive_answer; pick scope/format/decline/confused.',
    '   - Technical nouns inside a question to you still = meta.',
    '1. Meta + WHICH topic / X or Y? -> scope_clarification',
    '2. Meta + HOW to answer (brief/detailed)? -> format_clarification',
    '3. Meta + refuses whole question? -> decline_whole',
    '4. Meta + refuses only this aspect? -> decline_scoped or topic_refusal',
    '5. Meta + cannot parse question? -> confused',
    '6. Explains / attempts answer with technical content? -> substantive_answer',
    '7. Unrelated? -> off_topic',
    '',
    'Classify now.',
  );

  return lines.join('\n');
}
