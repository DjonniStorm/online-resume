import type { ApiOperation } from '@/shared/api';

import type { RequestStore } from './request-store';

export class ErrorStore {
  constructor(private readonly requests: RequestStore) {}

  forOperation(operation: ApiOperation): { error: unknown; status?: number } | undefined {
    const request = this.requests.latest(operation);
    if (!request || request.status === 'pending' || request.status === 'success') {
      return undefined;
    }
    return { error: request.error, status: request.httpStatus };
  }
}
