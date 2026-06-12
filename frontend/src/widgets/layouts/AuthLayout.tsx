import { Outlet, Link } from 'react-router-dom';
import { env } from '@shared/config/env';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link to="/" className="text-xl font-semibold text-brand-primary">
            {env.appName}
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
