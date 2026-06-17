import { Injectable } from '@nestjs/common';
import type {
  FinalEvaluationCategory,
  HireRecommendation,
} from '../ai-evaluation/types/evaluation.types';
import {
  DEFAULT_TOPIC_WEIGHT,
  mapStrengthCategory,
  readHireThresholds,
  readScoreThresholds,
  SCORE_NORMALIZED_MAX,
  SCORE_OUT_OF_TEN_MAX,
} from './scoring.constants';
import type {
  CategoryBreakdownItem,
  InterviewScoreResult,
  QuestionScoreInput,
  TopicSessionEvaluation,
} from './scoring.types';

type TopicAggregate = {
  topic: string;
  earned: number;
  max: number;
  weight: number;
};

@Injectable()
export class ScoringService {
  calculateInterviewScore(
    questions: QuestionScoreInput[],
  ): InterviewScoreResult {
    if (questions.length === 0) {
      return buildEmptyResult();
    }

    const topicGroups = aggregateByTopic(questions);
    const topics = topicGroups.map((group) => toTopicSessionEvaluation(group));
    const totalWeight = topics.reduce((sum, topic) => sum + topic.weight, 0);
    const finalScore =
      totalWeight > 0
        ? roundOneDecimal(
            topics.reduce((sum, topic) => sum + topic.weightedScore, 0) /
              totalWeight,
          )
        : 0;

    const averageScore =
      topics.length > 0
        ? roundOneDecimal(
            topics.reduce((sum, topic) => sum + topic.score, 0) /
              topics.length,
          )
        : 0;

    const totalScoreNormalized = roundOneDecimal(finalScore * 10);
    const breakdown = buildBreakdown(topics, totalWeight);

    return {
      finalScore,
      totalScoreNormalized,
      totalScoreOutOfTen: finalScore,
      totalWeight: roundOneDecimal(totalWeight),
      averageScore,
      strengthCategory: mapStrengthCategory(finalScore),
      category: mapCategory(totalScoreNormalized),
      hireRecommendation: mapHireRecommendation(totalScoreNormalized),
      topics,
      breakdown,
      needsManualReview: questions.some(
        (question) => question.needsManualReview,
      ),
    };
  }
}

function buildEmptyResult(): InterviewScoreResult {
  return {
    finalScore: 0,
    totalScoreNormalized: 0,
    totalScoreOutOfTen: 0,
    totalWeight: 0,
    averageScore: 0,
    strengthCategory: 'weak',
    category: 'weak',
    hireRecommendation: 'strong_reject',
    topics: [],
    breakdown: [],
    needsManualReview: false,
  };
}

function aggregateByTopic(questions: QuestionScoreInput[]): TopicAggregate[] {
  const groups = new Map<string, TopicAggregate>();

  for (const question of questions) {
    const topic = question.topicName?.trim() || 'General';
    const current = groups.get(topic) ?? {
      topic,
      earned: 0,
      max: 0,
      weight: resolveTopicWeight(question.topicWeight),
    };

    current.earned += question.score;
    current.max += question.maxScore;
    current.weight = Math.max(
      current.weight,
      resolveTopicWeight(question.topicWeight),
    );
    groups.set(topic, current);
  }

  return [...groups.values()].sort((left, right) =>
    left.topic.localeCompare(right.topic),
  );
}

function toTopicSessionEvaluation(group: TopicAggregate): TopicSessionEvaluation {
  const score = normalizeQuestionScoreToTen(group.earned, group.max);
  const weight = resolveTopicWeight(group.weight);

  return {
    topic: group.topic,
    score,
    weight,
    weightedScore: roundOneDecimal(score * weight),
    strengthCategory: mapStrengthCategory(score),
  };
}

function buildBreakdown(
  topics: TopicSessionEvaluation[],
  totalWeight: number,
): CategoryBreakdownItem[] {
  return topics.map((topic) => ({
    categoryKey: slugifyTopic(topic.topic),
    categoryLabel: topic.topic,
    scoreNormalized: roundOneDecimal(topic.score * 10),
    weight: topic.weight,
    contribution:
      totalWeight > 0
        ? roundOneDecimal(topic.weightedScore / totalWeight)
        : 0,
  }));
}

function normalizeQuestionScoreToTen(earned: number, max: number): number {
  if (max <= 0) {
    return 0;
  }

  return roundOneDecimal((earned / max) * SCORE_OUT_OF_TEN_MAX);
}

function resolveTopicWeight(weight: number | undefined): number {
  if (weight === undefined || !Number.isFinite(weight) || weight <= 0) {
    return DEFAULT_TOPIC_WEIGHT;
  }

  return weight;
}

function slugifyTopic(topic: string): string {
  return topic
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
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
