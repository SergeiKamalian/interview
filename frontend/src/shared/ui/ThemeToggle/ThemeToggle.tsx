import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { cn } from '@shared/lib/utils';
import { Button } from '../button';

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        className={cn(className)}
        disabled
        aria-hidden
      >
        <span className="size-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={cn('relative', className)}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Светлая тема' : 'Тёмная тема'}
    >
      <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon
        className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
      />
    </Button>
  );
}
