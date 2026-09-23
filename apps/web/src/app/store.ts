import { makeAutoObservable } from 'mobx';
import { createContext, useContext } from 'react';

export class RootStore {
  constructor() {
    makeAutoObservable(this);
  }
}

export const rootStore = new RootStore();

export const StoreContext = createContext(rootStore);

export function useRootStore() {
  return useContext(StoreContext);
}
