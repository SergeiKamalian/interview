import { createBrowserRouter } from 'react-router-dom';
import { PublicLayout } from '@widgets/layouts/PublicLayout';
import { AuthLayout } from '@widgets/layouts/AuthLayout';
import { DashboardLayout } from '@widgets/layouts/DashboardLayout';
import { HomePage } from '@pages/home/HomePage';
import { LoginPage } from '@pages/auth/LoginPage';
import { RegisterPage } from '@pages/auth/RegisterPage';
import { DashboardPage } from '@pages/dashboard/DashboardPage';
import { NotFoundPage } from '@pages/not-found/NotFoundPage';
import {
  GuestRoute,
  ProtectedRoute,
} from '@app/router/ProtectedRoute';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [{ path: '/', element: <HomePage /> }],
  },
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [{ path: '/dashboard', element: <DashboardPage /> }],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
