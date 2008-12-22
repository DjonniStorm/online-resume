import { NuqsAdapter } from 'nuqs/adapters/react-router/v8';
import type { ReactNode } from 'react';

export function AppNuqsProvider({ children }: { children: ReactNode }) {
  return <NuqsAdapter>{children}</NuqsAdapter>;
}
