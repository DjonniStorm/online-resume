import { UnheadProvider } from '@unhead/react/client';
import type { PropsWithChildren } from 'react';

export function AppHeadProvider({ children }: PropsWithChildren) {
  return <UnheadProvider>{children}</UnheadProvider>;
}
