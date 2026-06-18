import type { CandidateTurnClassifierInput } from '../types/candidate-turn-classifier.types';

export const CANDIDATE_TURN_CLASSIFIER_PROMPT_KEY = 'candidate_turn_classifier';
export const CANDIDATE_TURN_CLASSIFIER_PROMPT_VERSION = '1.2.0';

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
    'scope_clarification (speech act A — WHAT topic/scope OR unclear interviewer wording):',
    '- Asks what you meant, which sub-topic, or offers alternatives ("X or Y?").',
    '- Says they did NOT understand your question and asks you to explain/rephrase/clarify.',
    '  ("Не понял о чем вопрос", "Можете подробнее?", "Можете переформулировать?" -> scope_clarification)',
    '- Confirms scope without teaching: "So you mean scheduler inside Fiber?"',
    '- Echoes your follow-up as a question back to you.',
    '- Technical terms may appear — they disambiguate your question, not answer it.',
    '- PRIMARY speech act wins: if they ask you to clarify YOUR question, scope_clarification',
    '  even when the message also contains partial/wrong technical content.',
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
    'confused (speech act A — rare, NOT "did not understand your question"):',
    '- Candidate is lost mid-thought but does NOT ask you to clarify/rephrase your wording.',
    '- Do NOT use confused when they explicitly ask what you meant or to rephrase your question',
    '  — that is always scope_clarification (triggers interviewer clarification redirect).',
    '- "Не понял вопрос" / "не понял о чем вопрос" / "можете переформулировать" -> scope_clarification, NOT confused.',
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
    '1. Meta + asks what YOU meant / did not understand YOUR question / rephrase? -> scope_clarification',
    '2. Meta + WHICH topic / X or Y? -> scope_clarification',
    '3. Meta + HOW to answer (brief/detailed)? -> format_clarification',
    '4. Meta + refuses whole question? -> decline_whole',
    '5. Meta + refuses only this aspect? -> decline_scoped or topic_refusal',
    '6. Meta + lost but NOT asking you to clarify wording? -> confused (rare)',
    '7. Explains / attempts answer with technical content (and NOT asking you to rephrase)? -> substantive_answer',
    '8. Unrelated? -> off_topic',
    '',
    'Classify now.',
  );

  return lines.join('\n');
}
