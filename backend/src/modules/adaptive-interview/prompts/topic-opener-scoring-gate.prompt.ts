import type { TopicOpenerScoringGateInput } from '../types/topic-opener-scoring-gate.types';

export const TOPIC_OPENER_SCORING_GATE_PROMPT_KEY = 'topic_opener_scoring_gate';
export const TOPIC_OPENER_SCORING_GATE_PROMPT_VERSION = '1.0.0';

const RESPONSE_JSON_SCHEMA = `{
  "should_score": "boolean",
  "reason": "one sentence in Russian explaining the decision"
}`;

export function buildTopicOpenerScoringGateSystemPrompt(): string {
  return [
    'You decide whether a candidate topic-opener reply already contains enough technical substance to score against interview checkpoints.',
    'This is a lightweight gate BEFORE full evaluation — be precise, not generous.',
    '',
    'Context: the interviewer asked a short readiness check ("are you familiar with X?").',
    'The candidate replied. Sometimes they only signal familiarity; sometimes they already explain the topic.',
    '',
    'should_score = true ONLY when the candidate already EXPLAINS technical content relevant to the upcoming question:',
    '- mechanisms, architecture, steps, tradeoffs, examples, how something works',
    '- partial or uncertain explanations still count if they teach something concrete',
    '',
    'should_score = false when the reply is ONLY readiness / attitude without teaching:',
    '- "да, знаком", "немного знаком", "работал с этим", "слышал", "на практике не было"',
    '- confirms familiarity but adds no technical explanation',
    '- vague confidence without any substantive claims about the topic',
    '',
    'Do NOT score correctness — only whether there is material worth evaluating now.',
    'Do NOT use character length or word count. Judge meaning only.',
    '',
    'Return valid JSON only, no markdown fences:',
    RESPONSE_JSON_SCHEMA,
  ].join('\n');
}

export function buildTopicOpenerScoringGateUserPrompt(
  input: TopicOpenerScoringGateInput,
): string {
  const lines = [
    'Upcoming bank question (for topic context only):',
    input.questionText.trim() || '(none)',
    '',
    'Topic opener from interviewer:',
    input.topicOpenerText.trim() || '(none)',
    '',
    'Candidate opener reply:',
    input.candidateAnswer.trim() || '(empty)',
  ];

  const reference = input.referenceAnswer?.trim();
  if (reference) {
    lines.push('', 'Reference answer (context only — never reveal):', reference);
  }

  lines.push('', 'Decide should_score now.');

  return lines.join('\n');
}
