import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_SCROLL_OFFSET = 112;
const DEFAULT_VISIBILITY_RATIO = 0.5;
const BOTTOM_EPSILON = 24;

type UseScrollSpyOptions = {
  /** Отступ под фиксированный header (px). */
  scrollOffset?: number;
  /** Доля viewport снизу, исключаемая из зоны активации (0.5 = верхняя половина экрана). */
  visibilityRatio?: number;
};

function isNearPageBottom(): boolean {
  const { scrollHeight } = document.documentElement;
  return (
    window.scrollY + window.innerHeight >= scrollHeight - BOTTOM_EPSILON
  );
}

export function useScrollSpy(
  sectionIds: readonly string[],
  options: UseScrollSpyOptions = {},
) {
  const scrollOffset = options.scrollOffset ?? DEFAULT_SCROLL_OFFSET;
  const visibilityRatio = options.visibilityRatio ?? DEFAULT_VISIBILITY_RATIO;

  const [activeId, setActiveId] = useState<string | null>(
    sectionIds[0] ?? null,
  );
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);
  const ratiosRef = useRef<Map<string, number>>(new Map());

  const resolveActiveSection = useCallback(() => {
    if (isProgrammaticScrollRef.current || sectionIds.length === 0) {
      return;
    }

    if (isNearPageBottom()) {
      setActiveId(sectionIds[sectionIds.length - 1]);
      return;
    }

    let bestId = sectionIds[0];
    let bestRatio = -1;

    for (const id of sectionIds) {
      const ratio = ratiosRef.current.get(id) ?? 0;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestId = id;
      }
    }

    if (bestRatio > 0) {
      setActiveId(bestId);
      return;
    }

    let current = sectionIds[0];

    for (const id of sectionIds) {
      const element = document.getElementById(id);
      if (element && element.getBoundingClientRect().top <= scrollOffset) {
        current = id;
      }
    }

    setActiveId(current);
  }, [scrollOffset, sectionIds]);

  useEffect(() => {
    if (sectionIds.length === 0) {
      return;
    }

    ratiosRef.current = new Map();

    const bottomMarginPercent = Math.round((1 - visibilityRatio) * 100);
    const rootMargin = `-${scrollOffset}px 0px -${bottomMarginPercent}% 0px`;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratiosRef.current.set(entry.target.id, entry.intersectionRatio);
        }
        resolveActiveSection();
      },
      {
        root: null,
        rootMargin,
        threshold: [0, 0.01, 0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    for (const id of sectionIds) {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    }

    resolveActiveSection();
    window.addEventListener('scroll', resolveActiveSection, { passive: true });
    window.addEventListener('resize', resolveActiveSection);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', resolveActiveSection);
      window.removeEventListener('resize', resolveActiveSection);
    };
  }, [resolveActiveSection, scrollOffset, sectionIds, visibilityRatio]);

  const scrollTo = useCallback(
    (id: string) => {
      const element = document.getElementById(id);

      if (!element) {
        return;
      }

      isProgrammaticScrollRef.current = true;
      setActiveId(id);

      const index = sectionIds.indexOf(id);
      const isLast = index === sectionIds.length - 1;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const targetTop =
        element.getBoundingClientRect().top + window.scrollY - scrollOffset;

      window.scrollTo({
        top: isLast
          ? Math.max(0, Math.min(targetTop, maxScroll))
          : Math.max(0, targetTop),
        behavior: 'smooth',
      });

      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
        scrollTimeoutRef.current = null;
        resolveActiveSection();
      }, 900);
    },
    [resolveActiveSection, scrollOffset, sectionIds],
  );

  useEffect(
    () => () => {
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    },
    [],
  );

  return { activeId, scrollTo };
}
