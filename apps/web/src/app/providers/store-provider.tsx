import type { ReactNode } from 'react';

import { StoreContext, rootStore } from '@/app/store';

export function AppStoreProvider({ children }: { children: ReactNode }) {
  return <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>;
}
