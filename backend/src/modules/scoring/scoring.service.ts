import { Injectable } from '@nestjs/common';
import type {
  FinalEvaluationCategory,
  HireRecommendation,
} from '../ai-evaluation/types/evaluation.types';
import {
  readHireThresholds,
  readScoreThresholds,
  SCORE_NORMALIZED_MAX,
} from './scoring.constants';
import type {
  CategoryBreakdownItem,
  InterviewScoreResult,
  QuestionScoreInput,
} from './scoring.types';

@Injectable()
export class ScoringService {
  calculateInterviewScore(
    questions: QuestionScoreInput[],
  ): InterviewScoreResult {
    if (questions.length === 0) {
      return {
        totalScoreNormalized: 0,
        totalScoreOutOfTen: 0,
        category: 'weak',
        hireRecommendation: 'strong_reject',
        breakdown: [],
        needsManualReview: false,
      };
    }

    const groups = new Map<
      string,
      { label: string; earned: number; max: number }
    >();

    for (const question of questions) {
      const categoryKey = buildCategoryKey(question);
      const label = buildCategoryLabel(question);
      const current = groups.get(categoryKey) ?? {
        label,
        earned: 0,
        max: 0,
      };

      current.earned += question.score;
      current.max += question.maxScore;
      groups.set(categoryKey, current);
    }

    let totalEarned = 0;
    let totalMax = 0;
    const breakdown: CategoryBreakdownItem[] = [];

    for (const [categoryKey, group] of groups.entries()) {
      totalEarned += group.earned;
      totalMax += group.max;

      breakdown.push({
        categoryKey,
        categoryLabel: group.label,
        scoreNormalized: normalizeScore(group.earned, group.max),
        weight: group.max,
        contribution: 0,
      });
    }

    breakdown.sort((left, right) =>
      left.categoryLabel.localeCompare(right.categoryLabel),
    );

    const totalScoreNormalized = normalizeScore(totalEarned, totalMax);
    const withContributions = recalculateContributions(breakdown, totalMax);

    return {
      totalScoreNormalized,
      totalScoreOutOfTen: roundOneDecimal(totalScoreNormalized / 10),
      category: mapCategory(totalScoreNormalized),
      hireRecommendation: mapHireRecommendation(totalScoreNormalized),
      breakdown: withContributions,
      needsManualReview: questions.some(
        (question) => question.needsManualReview,
      ),
    };
  }
}

function buildCategoryKey(question: QuestionScoreInput): string {
  return [
    question.topicName?.trim() || 'general',
    question.difficulty,
    question.level,
  ].join(':');
}

function buildCategoryLabel(question: QuestionScoreInput): string {
  const topic = question.topicName?.trim() || 'General';
  return `${topic} (${question.level}/${question.difficulty})`;
}

function normalizeScore(earned: number, max: number): number {
  if (max <= 0) {
    return 0;
  }

  return roundOneDecimal((earned / max) * SCORE_NORMALIZED_MAX);
}

function recalculateContributions(
  breakdown: CategoryBreakdownItem[],
  totalMax: number,
): CategoryBreakdownItem[] {
  if (totalMax <= 0) {
    return breakdown.map((item) => ({ ...item, contribution: 0 }));
  }

  return breakdown.map((item) => ({
    ...item,
    contribution: roundOneDecimal(
      (item.scoreNormalized * item.weight) / totalMax,
    ),
  }));
}

function mapCategory(score: number): FinalEvaluationCategory {
  const thresholds = readScoreThresholds();
  if (score >= thresholds.good) return 'strong';
  if (score >= thresholds.average) return 'good';
  if (score >= thresholds.basic) return 'average';
  if (score >= thresholds.weak) return 'basic';
  return 'weak';
}

function mapHireRecommendation(score: number): HireRecommendation {
  const thresholds = readHireThresholds();
  if (score >= thresholds.invite) return 'strong_invite';
  if (score >= thresholds.maybe) return 'invite';
  if (score >= thresholds.reject) return 'maybe';
  if (score >= thresholds.strongReject) return 'reject';
  return 'strong_reject';
}

function roundOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}
