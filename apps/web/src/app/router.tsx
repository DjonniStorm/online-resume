import type { ReactNode } from 'react';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router';

import { useClearRequestsOnUnmount } from '@/app/hooks/use-clear-requests-on-unmount';
import { AppNuqsProvider } from '@/app/providers';
import { LoginPage } from '@/pages/auth/login/ui/LoginPage';
import { RegisterPage } from '@/pages/auth/register/ui/RegisterPage';
import { HomePage } from '@/pages/home/ui/HomePage';

function PageRoute({ children }: { children: ReactNode }) {
  useClearRequestsOnUnmount();
  return children;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AppNuqsProvider>
        <Outlet />
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
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
