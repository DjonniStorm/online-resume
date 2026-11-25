import { makeAutoObservable } from 'mobx';

import type { ApiOperation, ApiRequest, UUID } from '@/shared/api';

export class RequestStore {
  readonly byOperation = new Map<ApiOperation, ApiRequest>();
  private readonly requestPages = new Map<UUID, UUID>();
  private currentPage: UUID | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  beginPage(pageId: UUID): void {
    this.currentPage = pageId;
  }

  track(request: ApiRequest): void {
    const current = this.byOperation.get(request.operation);

    if (request.status === 'pending') {
      if (current?.status === 'pending') {
        current.abort();
      }
      if (current) {
        this.requestPages.delete(current.id);
      }
      if (request.clearOnUnmount && this.currentPage) {
        this.requestPages.set(request.id, this.currentPage);
      }
      this.byOperation.set(request.operation, request);
      return;
    }

    if (current?.id === request.id) {
      this.byOperation.set(request.operation, request);
    }
  }

  latest(operation: ApiOperation): ApiRequest | undefined {
    return this.byOperation.get(operation);
  }

  isLatest(operation: ApiOperation, id: UUID): boolean {
    return this.byOperation.get(operation)?.id === id;
  }

  clearPage(pageId: UUID): void {
    for (const [operation, request] of this.byOperation) {
      if (!request.clearOnUnmount || this.requestPages.get(request.id) !== pageId) {
        continue;
      }
      if (request.status === 'pending') {
        request.abort();
      }
      this.byOperation.delete(operation);
      this.requestPages.delete(request.id);
    }
    if (this.currentPage === pageId) {
      this.currentPage = null;
    }
  }

  get pending(): ApiRequest[] {
    return [...this.byOperation.values()].filter((request) => request.status === 'pending');
  }
}
