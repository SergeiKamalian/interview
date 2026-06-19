import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

import { THEME_STORAGE_KEY } from '@shared/lib/theme';

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey={THEME_STORAGE_KEY}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
