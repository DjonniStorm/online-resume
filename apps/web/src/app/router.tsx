import type { PropsWithChildren } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router';

import { useClearRequestsOnUnmount } from '@/app/hooks/use-clear-requests-on-unmount';
import { AppNuqsProvider } from '@/app/providers';
import { LoginPage } from '@/pages/auth/login/ui/LoginPage';
import { RegisterPage } from '@/pages/auth/register/ui/RegisterPage';
import { HomePage } from '@/pages/home/ui/HomePage';
import { PublicResumePage } from '@/pages/public-resume';
import { ResumeEditPage } from '@/pages/resume-edit';
import { ResumePreviewPage } from '@/pages/resume-preview';
import { ResumesPage } from '@/pages/resumes';
import { TemplatesPage } from '@/pages/templates';
import { AppShell } from '@/widgets/app-shell';

function PageRoute({ children }: PropsWithChildren) {
  useClearRequestsOnUnmount();
  return children;
}

const router = createBrowserRouter([
  {
    path: '/r/:slug',
    element: (
      <PageRoute key="public-resume">
        <PublicResumePage />
      </PageRoute>
    ),
  },
  {
    path: '/',
    element: (
      <AppNuqsProvider>
        <AppShell />
      </AppNuqsProvider>
    ),
    children: [
      {
        index: true,
        element: (
          <PageRoute key="home">
            <HomePage />
          </PageRoute>
        ),
      },
      {
        path: 'auth/login',
        element: (
          <PageRoute key="login">
            <LoginPage />
          </PageRoute>
        ),
      },
      {
        path: 'auth/register',
        element: (
          <PageRoute key="register">
            <RegisterPage />
          </PageRoute>
        ),
      },
      {
        path: 'templates',
        element: (
          <PageRoute key="templates">
            <TemplatesPage />
          </PageRoute>
        ),
      },
      {
        path: 'resumes',
        element: (
          <PageRoute key="resumes">
            <ResumesPage />
          </PageRoute>
        ),
      },
      {
        path: 'resumes/:id/preview',
        element: (
          <PageRoute key="resume-preview">
            <ResumePreviewPage />
          </PageRoute>
        ),
      },
      {
        path: 'resumes/:id/edit',
        element: (
          <PageRoute key="resume-edit">
            <ResumeEditPage />
          </PageRoute>
        ),
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
