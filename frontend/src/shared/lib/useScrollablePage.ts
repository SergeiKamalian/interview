import { useEffect, useState } from 'react';

/** Страница длиннее viewport минимум на `minExtraViewportRatio` (0.5 = +50%). */
export function useScrollablePage(minExtraViewportRatio = 0.5) {
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    const measure = () => {
      const viewport = window.innerHeight;
      const content = document.documentElement.scrollHeight;
      setIsScrollable(content > viewport * (1 + minExtraViewportRatio));
    };

    measure();

    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('scroll', measure, { passive: true });

    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);
    if (document.body) {
      observer.observe(document.body);
    }

    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure);
      observer.disconnect();
    };
  }, [minExtraViewportRatio]);

  return isScrollable;
}
