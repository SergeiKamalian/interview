import { Suspense } from 'react';
import {
  Outlet,
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useLogoutMutation } from '@features/auth/api/authApi';
import { logout } from '@features/auth/model/authSlice';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import { env } from '@shared/config/env';
import {
  selectAuthCompany,
  selectAuthUser,
} from '@features/auth/model/selectors';
import { tokenStorage } from '@shared/lib/token-storage';
import { Button, Spinner } from '@shared/ui';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'block rounded-md px-3 py-2 text-sm',
    isActive
      ? 'bg-brand-primary text-white'
      : 'text-slate-700 hover:bg-slate-100',
  ].join(' ');

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  interviews: 'Interviews',
  candidates: 'Candidates',
  analytics: 'Analytics',
  questions: 'Question Bank',
  create: 'Create Interview',
};

function resolveDashboardMeta(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const section = segments[1] ?? 'dashboard';
  const subsection = segments[2];

  const breadcrumbs: { label: string; to?: string }[] = [
    { label: 'Dashboard', to: '/dashboard' },
  ];

  if (section !== 'dashboard' && PAGE_TITLES[section]) {
    breadcrumbs.push({
      label: PAGE_TITLES[section],
      to: `/dashboard/${section}`,
    });
  }

  if (segments[1] === 'candidates' && segments[2] && segments[3] === 'report') {
    breadcrumbs.push({ label: 'Candidates', to: '/dashboard/candidates' });
    breadcrumbs.push({ label: 'Report' });
  } else if (segments[1] === 'interviews' && segments[2] && segments[2] !== 'create') {
    breadcrumbs.push({ label: 'Interviews', to: '/dashboard/interviews' });
    breadcrumbs.push({ label: 'Details' });
  } else if (subsection && PAGE_TITLES[subsection]) {
    breadcrumbs.push({ label: PAGE_TITLES[subsection] });
  }

  const pageTitle =
    (subsection && PAGE_TITLES[subsection]) ??
    (section !== 'dashboard' ? PAGE_TITLES[section] : PAGE_TITLES.dashboard) ??
    'Dashboard';

  return { breadcrumbs, pageTitle };
}

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [logoutRequest, { isLoading: isLoggingOut }] = useLogoutMutation();
  const user = useAppSelector(selectAuthUser);
  const company = useAppSelector(selectAuthCompany);
  const { breadcrumbs, pageTitle } = resolveDashboardMeta(location.pathname);

  const handleLogout = async () => {
    try {
      await logoutRequest().unwrap();
    } finally {
      tokenStorage.clear();
      dispatch(logout());
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-slate-200 bg-white lg:w-64 lg:border-b-0 lg:border-r">
        <div className="px-4 py-5">
          <Link to="/" className="text-lg font-semibold text-brand-primary">
            {env.appName}
          </Link>
        </div>
        <nav className="space-y-1 px-3 pb-4">
          <NavLink to="/dashboard" end className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/dashboard/interviews" end className={navLinkClass}>
            Interviews
          </NavLink>
          <NavLink to="/dashboard/candidates" className={navLinkClass}>
            Candidates
          </NavLink>
          <NavLink to="/dashboard/analytics" className={navLinkClass}>
            Analytics
          </NavLink>
          <NavLink to="/dashboard/questions" className={navLinkClass}>
            Question Bank
          </NavLink>
          <NavLink to="/dashboard/interviews/create" className={navLinkClass}>
            Create Interview
          </NavLink>
        </nav>
      </aside>
      <div className="flex-1">
        <header className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-lg font-medium text-slate-900">{pageTitle}</h1>
              <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
                <ol className="flex flex-wrap items-center gap-1">
                  {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;

                    return (
                      <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                        {index > 0 && <span aria-hidden="true">/</span>}
                        {crumb.to && !isLast ? (
                          <Link
                            to={crumb.to}
                            className="hover:text-brand-primary hover:underline"
                          >
                            {crumb.label}
                          </Link>
                        ) : (
                          <span
                            className={isLast ? 'font-medium text-slate-700' : undefined}
                            aria-current={isLast ? 'page' : undefined}
                          >
                            {crumb.label}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </nav>
            </div>
            {user && company && (
              <div className="flex items-center gap-4">
                <div className="text-right text-sm">
                  <p className="font-medium text-slate-900">{user.fullName}</p>
                  <p className="text-slate-500">{company.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleLogout()}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? 'Signing out…' : 'Sign out'}
                </Button>
              </div>
            )}
          </div>
        </header>
        <main className="p-6">
          <Suspense
            fallback={
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Spinner />
                Загрузка страницы…
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
