import type { badgeVariants } from '@shared/ui';
import type { VariantProps } from 'class-variance-authority';
import type {
  QuestionDifficulty,
  QuestionLevel,
} from '@entities/question/model/types';

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

/**
 * Shared, semantic colors for question meta badges so difficulty/level read at a
 * glance (and stay consistent between the picker and the review screen).
 */
const DIFFICULTY_VARIANTS: Record<QuestionDifficulty, BadgeVariant> = {
  basic: 'success',
  intermediate: 'warning',
  advanced: 'orange',
};

const DIFFICULTY_LABELS: Record<QuestionDifficulty, string> = {
  basic: 'базовый',
  intermediate: 'средний',
  advanced: 'продвинутый',
};

const LEVEL_VARIANTS: Record<QuestionLevel, BadgeVariant> = {
  junior: 'info',
  middle: 'yellow',
  senior: 'orange',
  lead: 'default',
};

export function difficultyBadgeVariant(
  difficulty: QuestionDifficulty | string,
): BadgeVariant {
  return DIFFICULTY_VARIANTS[difficulty as QuestionDifficulty] ?? 'muted';
}

export function difficultyLabel(difficulty: QuestionDifficulty | string): string {
  return DIFFICULTY_LABELS[difficulty as QuestionDifficulty] ?? difficulty;
}

export function levelBadgeVariant(
  level: QuestionLevel | string,
): BadgeVariant {
  return LEVEL_VARIANTS[level as QuestionLevel] ?? 'muted';
}
