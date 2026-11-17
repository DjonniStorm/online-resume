import { useLayoutEffect, useRef } from 'react';

import { StoreKey, useStore } from '@/app/store';
import type { UUID } from '@/shared/api';

export function useClearRequestsOnUnmount(): void {
  const requests = useStore(StoreKey.Requests);
  const pageId = useRef<UUID>(crypto.randomUUID()).current;
  const mounted = useRef(false);

  useLayoutEffect(() => {
    requests.beginPage(pageId);
    mounted.current = true;

    return () => {
      mounted.current = false;
      queueMicrotask(() => {
        if (!mounted.current) {
          requests.clearPage(pageId);
        }
      });
    };
  }, [pageId, requests]);
}
