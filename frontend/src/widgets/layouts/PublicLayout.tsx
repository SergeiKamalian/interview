import { Outlet, Link } from 'react-router-dom';
import { env } from '@shared/config/env';

export function PublicLayout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold text-brand-primary">
            {env.appName}
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link to="/login" className="text-slate-600 hover:text-slate-900">
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
