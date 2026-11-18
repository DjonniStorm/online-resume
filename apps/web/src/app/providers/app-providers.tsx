import type { PropsWithChildren } from 'react';

import { GlobalLoader } from './global-loader';
import { AppHeadProvider } from './head-provider';
import { AppMantineProvider } from './mantine-provider';
import { AppSessionProvider } from './session-provider';
import { AppStoreProvider } from './store-provider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <AppHeadProvider>
      <AppMantineProvider>
        <AppStoreProvider>
          <GlobalLoader />
          <AppSessionProvider>{children}</AppSessionProvider>
        </AppStoreProvider>
      </AppMantineProvider>
    </AppHeadProvider>
  );
}
