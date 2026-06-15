import { Injectable, Logger } from '@nestjs/common';
import { EVIDENCE_MATCH_THRESHOLD } from '../prompts/guardrail-rules';
import type { CheckpointEvaluationContext } from '../types/checkpoint-evaluation.types';
import type { CheckpointEvaluationResultItem } from '../types/evaluation.types';

export type GuardrailViolation = {
  code: string;
  message: string;
};

export type GuardrailResult = {
  passed: boolean;
  needsManualReview: boolean;
  violations: GuardrailViolation[];
};

@Injectable()
export class HallucinationGuardService {
  private readonly logger = new Logger(HallucinationGuardService.name);

  validateCheckpointResults(
    context: CheckpointEvaluationContext,
    checkpointResults: CheckpointEvaluationResultItem[],
  ): GuardrailResult {
    const expectedKeys = new Set(
      context.checkpoints.map((checkpoint) => checkpoint.checkpointKey),
    );
    const violations: GuardrailViolation[] = [];

    for (const result of checkpointResults) {
      if (!expectedKeys.has(result.checkpointKey)) {
        violations.push({
          code: 'UNKNOWN_CHECKPOINT_KEY',
          message: `Unknown checkpoint key "${result.checkpointKey}"`,
        });
      }

      if (
        (result.status === 'met' || result.status === 'partially_met') &&
        !result.evidenceQuote.trim()
      ) {
        violations.push({
          code: 'MISSING_EVIDENCE_QUOTE',
          message: `Checkpoint "${result.checkpointKey}" marked ${result.status} without evidence`,
        });
      }

      if (
        result.evidenceQuote.trim() &&
        !isEvidenceSupported(context.candidateAnswer, result.evidenceQuote)
      ) {
        violations.push({
          code: 'EVIDENCE_NOT_IN_ANSWER',
          message: `Evidence for "${result.checkpointKey}" was not found in candidate answer`,
        });
      }
    }

    if (violations.length > 0) {
      this.logger.warn(
        `Guardrail violations attemptId=${context.attemptId} questionId=${context.interviewQuestionId} count=${violations.length}`,
      );
    }

    return {
      passed: violations.length === 0,
      needsManualReview: violations.length > 0,
      violations,
    };
  }
}

export function isEvidenceSupported(
  candidateAnswer: string,
  evidenceQuote: string,
): boolean {
  const normalizedAnswer = normalizeText(candidateAnswer);
  const normalizedEvidence = normalizeText(evidenceQuote);

  if (!normalizedEvidence) {
    return true;
  }

  if (normalizedAnswer.includes(normalizedEvidence)) {
    return true;
  }

  return fuzzyContains(normalizedAnswer, normalizedEvidence);
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function fuzzyContains(source: string, fragment: string): boolean {
  if (fragment.length <= 3) {
    return source.includes(fragment);
  }

  const words = fragment.split(' ').filter(Boolean);
  if (words.length === 0) {
    return true;
  }

  const matchedWords = words.filter((word) => source.includes(word)).length;
  return matchedWords / words.length >= EVIDENCE_MATCH_THRESHOLD;
}
