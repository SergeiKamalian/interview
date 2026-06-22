import { useScrollSpy } from '@shared/lib/useScrollSpy';
import { useScrollablePage } from '@shared/lib/useScrollablePage';
import {
  PageSectionDock,
  type PageSectionDockItem,
} from './PageSectionDock';

type PageSectionNavProps = {
  sections: readonly PageSectionDockItem[];
  /** Минимальная «лишняя» высота относительно viewport (0.5 = +50%). */
  minExtraViewportRatio?: number;
  scrollOffset?: number;
  /** Доля viewport для зоны активации секции (0.5 = верхняя половина). */
  visibilityRatio?: number;
  className?: string;
};

/**
 * Фиксированная навигация по секциям страницы.
 * Показывается на длинных страницах (контент > viewport + minExtraViewportRatio).
 * Секции: id + className `scroll-mt-28`, у контейнера страницы — `pb-24`.
 */
export function PageSectionNav({
  sections,
  minExtraViewportRatio = 0.5,
  scrollOffset,
  visibilityRatio,
  className,
}: PageSectionNavProps) {
  const sectionIds = sections.map((section) => section.id);
  const isScrollable = useScrollablePage(minExtraViewportRatio);
  const { activeId, scrollTo } = useScrollSpy(sectionIds, {
    scrollOffset,
    visibilityRatio,
  });

  if (!isScrollable || sections.length < 2) {
    return null;
  }

  return (
    <PageSectionDock
      sections={sections}
      activeId={activeId}
      onSelect={scrollTo}
      className={className}
    />
  );
}

/** Отступы для страниц с PageSectionNav. */
export const PAGE_SECTION_NAV_LAYOUT = {
  sectionClassName: 'scroll-mt-28',
  pageClassName: 'pb-24',
} as const;
