import {
  Ban,
  Check,
  CircleHelp,
  ThumbsDown,
  ThumbsUp,
  type LucideIcon,
} from "lucide-react";
import type { VariantProps } from "class-variance-authority";

import { badgeVariants } from "@shared/ui/badge";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export const HIRE_RECOMMENDATION_KEYS = [
  "strong_invite",
  "invite",
  "maybe",
  "reject",
  "strong_reject",
] as const;

export type HireRecommendationKey = (typeof HIRE_RECOMMENDATION_KEYS)[number];

export const HIRE_RECOMMENDATION_META: Record<
  HireRecommendationKey,
  { label: string; variant: BadgeVariant; Icon: LucideIcon }
> = {
  strong_invite: {
    label: "Сильно пригласить",
    variant: "success",
    Icon: ThumbsUp,
  },
  invite: {
    label: "Пригласить",
    variant: "info",
    Icon: Check,
  },
  maybe: {
    label: "Под вопросом",
    variant: "warning",
    Icon: CircleHelp,
  },
  reject: {
    label: "Отказать",
    variant: "orange",
    Icon: ThumbsDown,
  },
  strong_reject: {
    label: "Сильно отказать",
    variant: "destructive",
    Icon: Ban,
  },
};

export const HIRE_RECOMMENDATION_FILTER_OPTIONS = [
  { value: "all", label: "Все рекомендации" },
  ...HIRE_RECOMMENDATION_KEYS.map((key) => ({
    value: key,
    label: HIRE_RECOMMENDATION_META[key].label,
  })),
];

export function getHireRecommendationMeta(value: string) {
  return (
    HIRE_RECOMMENDATION_META[value as HireRecommendationKey] ?? {
      label: value.replaceAll("_", " "),
      variant: "muted" as BadgeVariant,
      Icon: CircleHelp,
    }
  );
}
