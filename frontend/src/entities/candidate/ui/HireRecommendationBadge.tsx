import { cn } from "@shared/lib/utils";
import { Badge } from "@shared/ui";

import { getHireRecommendationMeta } from "../lib/hireRecommendationMeta";

type HireRecommendationBadgeProps = {
  value?: string | null;
  size?: "sm" | "md";
  iconOnly?: boolean;
  className?: string;
};

export function HireRecommendationBadge({
  value,
  size = "md",
  iconOnly = false,
  className,
}: HireRecommendationBadgeProps) {
  if (!value) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  const meta = getHireRecommendationMeta(value);
  const Icon = meta.Icon;

  return (
    <Badge
      variant={meta.variant}
      className={cn(
        "max-w-full font-medium",
        size === "sm" && "h-auto gap-1 px-1.5 py-0.5 text-[11px]",
        size === "md" && "h-auto gap-1 px-2 py-0.5 text-xs",
        className,
      )}
      title={iconOnly ? meta.label : undefined}
    >
      <Icon className={cn(size === "sm" ? "size-3" : "size-3.5")} />
      {!iconOnly ? (
        <span className="truncate">{meta.label}</span>
      ) : null}
    </Badge>
  );
}
