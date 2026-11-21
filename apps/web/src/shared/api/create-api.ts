import { type ApiObserver, type ApiOptions, BaseApi } from './base-api';
import { type Client, type Config, createClient } from './generated/client';

export type CreateApiOptions = ApiOptions & {
  client?: Client;
  clientConfig?: Config;
  logging?: boolean;
};

const consoleObserver: ApiObserver = (request) => {
  const label = `[api:${request.id}] ${request.operation}`;
  if (request.status === 'pending') {
    console.info(`${label} started`);
    return;
  }

  console.group(label);
  try {
    console.log('result', request.status);
    console.log('status', request.httpStatus ?? 'no response');
    console.log('duration', `${Math.round(performance.now() - request.startedAt)} ms`);
  } finally {
    console.groupEnd();
  }
};

export function createApi(options: CreateApiOptions = {}): BaseApi {
  const observers = [...(options.observers ?? [])];
  if (options.logging) {
    observers.push(consoleObserver);
  }

  return new BaseApi(options.client ?? createClient(options.clientConfig), {
    timeoutMs: options.timeoutMs,
    observers,
  });
}
