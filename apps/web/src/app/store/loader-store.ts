import { computed, makeObservable } from 'mobx';

import type { ApiOperation } from '@/shared/api';

import type { RequestStore } from './request-store';

export class LoaderStore {
  constructor(private readonly requests: RequestStore) {
    makeObservable(this, { active: computed, visible: computed });
  }

  get active() {
    return this.requests.pending.filter((request) => request.showLoader);
  }

  get visible(): boolean {
    return this.active.length > 0;
  }

  isLoading(operation: ApiOperation): boolean {
    return this.requests.latest(operation)?.status === 'pending';
  }
}
