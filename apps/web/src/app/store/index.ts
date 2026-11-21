import { createContext, useContext } from 'react';

import { RootStore } from './root-store';
import { StoreKey } from './store-key';

export { RootStore, StoreKey };

export const rootStore = new RootStore();
export const StoreContext = createContext(rootStore);

export function useRootStore(): RootStore {
  return useContext(StoreContext);
}

export function useStore<K extends StoreKey>(key: K): RootStore[K] {
  return useRootStore().get(key);
}

export function useStores<const K extends readonly StoreKey[]>(
  ...keys: K
): Pick<RootStore, K[number]> {
  return useRootStore().getAll(...keys);
}
