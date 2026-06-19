import { Outlet, Link } from 'react-router-dom';
import { env } from '@shared/config/env';
import { ThemeToggle } from '@shared/ui';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link
            to="/"
            className="text-lg font-semibold tracking-tight text-foreground"
          >
            {env.appName}
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <ThemeToggle />
            <Link
              to="/login"
              className="px-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
