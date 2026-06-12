const TOKEN_STORAGE_KEY = 'ai_interviewer_access_token';

export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },

  set(token: string): void {
    if (!token.trim()) {
      return;
    }
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  },

  clear(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  },
};
