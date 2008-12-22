import { UnheadProvider } from '@unhead/react/client';
import type { ReactNode } from 'react';

export function AppHeadProvider({ children }: { children: ReactNode }) {
  return <UnheadProvider>{children}</UnheadProvider>;
}
