import type { PropsWithChildren } from 'react';

import { StoreContext, rootStore } from '@/app/store';

export function AppStoreProvider({ children }: PropsWithChildren) {
  return <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>;
}
