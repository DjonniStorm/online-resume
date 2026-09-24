import { MantineProvider } from '@mantine/core';
import { UnheadProvider } from '@unhead/react/client';
import type { ReactNode } from 'react';

import { StoreContext, rootStore } from './store';

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <UnheadProvider>
      <MantineProvider>
        <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
      </MantineProvider>
    </UnheadProvider>
  );
}
