import type { QuestionListItem, QuestionStatus } from '@entities/question/model/types';
import {
  difficultyBadgeVariant,
  difficultyLabel,
  levelBadgeVariant,
  type BadgeVariant,
} from '@entities/question/lib/questionBadgeVariants';
import { Badge } from '@shared/ui';
import { CustomScopeBadge } from './CustomScopeBadge';

function statusBadgeVariant(status: QuestionStatus): BadgeVariant {
  return status === 'draft' ? 'warning' : 'success';
}

export function QuestionScopeBadges({
  item,
  hasCompanyFork,
}: {
  item: QuestionListItem;
  /** Global question has a published company fork for this tenant. */
  hasCompanyFork?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {item.isCustom && <CustomScopeBadge />}
      {hasCompanyFork && (
        <Badge variant="muted">Есть ваша копия</Badge>
      )}
      {item.status === 'draft' && (
        <Badge variant={statusBadgeVariant(item.status)}>Черновик</Badge>
      )}
      {item.isRequired && <Badge variant="orange">Обязательный</Badge>}
      {!item.isActive && <Badge variant="muted">В архиве</Badge>}
    </div>
  );
}

export function QuestionMetaBadges({ item }: { item: QuestionListItem }) {
  return (
    <div className="flex flex-wrap gap-1">
      <Badge variant={levelBadgeVariant(item.level)}>{item.level}</Badge>
      <Badge variant={difficultyBadgeVariant(item.difficulty)}>
        {difficultyLabel(item.difficulty)}
      </Badge>
    </div>
  );
}
