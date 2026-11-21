import { NuqsAdapter } from 'nuqs/adapters/react-router/v8';
import type { PropsWithChildren } from 'react';

export function AppNuqsProvider({ children }: PropsWithChildren) {
  return <NuqsAdapter>{children}</NuqsAdapter>;
}
