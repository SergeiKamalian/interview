import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '@features/auth/api/authApi';
import { logout } from '@features/auth/model/authSlice';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import { env } from '@shared/config/env';
import {
  selectAuthCompany,
  selectAuthUser,
} from '@features/auth/model/selectors';
import { tokenStorage } from '@shared/lib/token-storage';
import { Button } from '@shared/ui';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'block rounded-md px-3 py-2 text-sm',
    isActive
      ? 'bg-brand-primary text-white'
      : 'text-slate-700 hover:bg-slate-100',
  ].join(' ');

export function DashboardLayout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [logoutRequest, { isLoading: isLoggingOut }] = useLogoutMutation();
  const user = useAppSelector(selectAuthUser);
  const company = useAppSelector(selectAuthCompany);

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
          <NavLink to="/dashboard" className={navLinkClass}>
            Dashboard
          </NavLink>
        </nav>
      </aside>
      <div className="flex-1">
        <header className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-lg font-medium text-slate-900">Dashboard</h1>
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
          <Outlet />
        </main>
      </div>
    </div>
  );
}
