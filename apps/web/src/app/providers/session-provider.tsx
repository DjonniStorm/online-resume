import { type PropsWithChildren, useEffect } from 'react';

import { StoreKey, useStore } from '@/app/store';

export function AppSessionProvider({ children }: PropsWithChildren) {
  const sessionStore = useStore(StoreKey.Session);
  useEffect(() => {
    void sessionStore.restore();
  }, []);

  return children;
}
