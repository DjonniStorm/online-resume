import { NuqsAdapter } from 'nuqs/adapters/react-router/v8';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <NuqsAdapter>
        <Outlet />
      </NuqsAdapter>
    ),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
