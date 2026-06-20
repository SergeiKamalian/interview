import { Suspense, type CSSProperties } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '@features/auth/api/authApi';
import { logout } from '@features/auth/model/authSlice';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import { env } from '@shared/config/env';
import {
  selectAuthCompany,
  selectAuthUser,
} from '@features/auth/model/selectors';
import { tokenStorage } from '@shared/lib/token-storage';
import { AppSidebar } from '@shared/ui/app-sidebar';
import { SiteHeader } from '@shared/ui/site-header';
import { SidebarInset, SidebarProvider } from '@shared/ui/sidebar';
import { Spinner } from '@shared/ui';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Дашборд',
  interviews: 'Интервью',
  review: 'Очередь проверки',
  attempts: 'Кандидаты',
  candidates: 'Кандидаты',
  analytics: 'Аналитика',
  questions: 'Банк вопросов',
  create: 'Создать интервью',
};

function resolvePageTitle(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const section = segments[1] ?? 'dashboard';
  const subsection = segments[2];

  if (segments[1] === 'candidates' && segments[2] && segments[3] === 'report') {
    return 'Отчёт кандидата';
  }

  if (
    segments[1] === 'interviews' &&
    segments[2] &&
    segments[3] === 'attempts' &&
    segments[4] &&
    segments[5] === 'review'
  ) {
    return 'Проверка кандидата';
  }

  if (segments[1] === 'interviews' && segments[2] && segments[2] !== 'create') {
    return 'Детали интервью';
  }

  return (
    (subsection && PAGE_TITLES[subsection]) ??
    (section !== 'dashboard' ? PAGE_TITLES[section] : PAGE_TITLES.dashboard) ??
    'Дашборд'
  );
}

const sidebarStyle = {
  '--sidebar-width': 'calc(var(--spacing) * 72)',
  '--header-height': 'calc(var(--spacing) * 12)',
} as CSSProperties;

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [logoutRequest, { isLoading: isLoggingOut }] = useLogoutMutation();
  const user = useAppSelector(selectAuthUser);
  const company = useAppSelector(selectAuthCompany);
  const pageTitle = resolvePageTitle(location.pathname);
  const isOverview = location.pathname === '/dashboard';

  const handleLogout = async () => {
    try {
      await logoutRequest().unwrap();
    } finally {
      tokenStorage.clear();
      dispatch(logout());
      navigate('/login', { replace: true });
    }
  };

  const sidebarUser = user
    ? {
        name: user.fullName,
        email: user.email,
        avatar: '',
      }
    : undefined;

  return (
    <SidebarProvider style={sidebarStyle}>
      <AppSidebar
        variant="inset"
        companyName={company?.name ?? env.appName}
        user={sidebarUser}
        onLogout={() => void handleLogout()}
        isLoggingOut={isLoggingOut}
      />
      <SidebarInset>
        <SiteHeader title={pageTitle} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <Suspense
              fallback={
                <div className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground md:px-6">
                  <Spinner />
                  Загрузка страницы…
                </div>
              }
            >
              {isOverview ? (
                <Outlet />
              ) : (
                <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
                  <Outlet />
                </div>
              )}
            </Suspense>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
