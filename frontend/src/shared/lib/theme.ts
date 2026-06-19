export type Theme = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'theme';

export function applyTheme(theme: 'light' | 'dark'): void {
  const root = document.documentElement;

  if (theme === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
}

export function getSystemTheme(): 'light' | 'dark' {
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }

  return 'light';
}
