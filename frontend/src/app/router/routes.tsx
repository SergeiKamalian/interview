/* eslint-disable react-refresh/only-export-components -- route module mixes lazy page imports with router config */
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { PublicLayout } from '@widgets/layouts/PublicLayout';
import { AuthLayout } from '@widgets/layouts/AuthLayout';
import { DashboardLayout } from '@widgets/layouts/DashboardLayout';
import { HomePage } from '@pages/home/HomePage';
import { LoginPage } from '@pages/auth/LoginPage';
import { RegisterPage } from '@pages/auth/RegisterPage';
import { QuestionBankPage } from '@pages/dashboard/QuestionBankPage';
import { CreateInterviewPage } from '@pages/dashboard/CreateInterviewPage';
import { PublicInterviewStartPage } from '@pages/public/PublicInterviewStartPage';
import { PublicInterviewSessionPage } from '@pages/public/PublicInterviewSessionPage';
import { PublicInterviewCompletePage } from '@pages/public/PublicInterviewCompletePage';
import { NotFoundPage } from '@pages/not-found/NotFoundPage';
import {
  GuestRoute,
  ProtectedRoute,
} from '@app/router/ProtectedRoute';

const DashboardOverviewPage = lazy(() =>
  import('@pages/dashboard/index').then((module) => ({
    default: module.DashboardOverviewPage,
  })),
);

const InterviewsPage = lazy(() =>
  import('@pages/dashboard/interviews/InterviewsPage').then((module) => ({
    default: module.InterviewsPage,
  })),
);

const CandidatesPage = lazy(() =>
  import('@pages/dashboard/candidates/CandidatesPage').then((module) => ({
    default: module.CandidatesPage,
  })),
);

const AnalyticsPage = lazy(() =>
  import('@pages/dashboard/analytics/AnalyticsPage').then((module) => ({
    default: module.AnalyticsPage,
  })),
);

const InterviewDetailsPage = lazy(() =>
  import('@pages/dashboard/interviews/InterviewDetailsPage').then((module) => ({
    default: module.InterviewDetailsPage,
  })),
);

const CandidateReportPage = lazy(() =>
  import('@pages/dashboard/candidates/CandidateReportPage').then((module) => ({
    default: module.CandidateReportPage,
  })),
);

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/i/:token', element: <PublicInterviewStartPage /> },
      { path: '/i/:token/session', element: <PublicInterviewSessionPage /> },
      { path: '/i/:token/complete', element: <PublicInterviewCompletePage /> },
    ],
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
        children: [
          { path: '/dashboard', element: <DashboardOverviewPage /> },
          { path: '/dashboard/interviews', element: <InterviewsPage /> },
          { path: '/dashboard/interviews/:interviewId', element: <InterviewDetailsPage /> },
          { path: '/dashboard/candidates', element: <CandidatesPage /> },
          { path: '/dashboard/candidates/:candidateId/report', element: <CandidateReportPage /> },
          { path: '/dashboard/analytics', element: <AnalyticsPage /> },
          { path: '/dashboard/questions', element: <QuestionBankPage /> },
          { path: '/dashboard/interviews/create', element: <CreateInterviewPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
