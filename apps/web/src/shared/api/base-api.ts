import { ApiOperation } from './api-operation';
import type { Client, Config } from './generated/client';

const sessionOperations = new Set<ApiOperation>([
  ApiOperation.SessionLogin,
  ApiOperation.SessionRegister,
  ApiOperation.SessionRefresh,
  ApiOperation.SessionLogout,
]);

export type UUID = ReturnType<typeof crypto.randomUUID>;

export type ApiRequest = {
  id: UUID;
  operation: ApiOperation;
  showLoader: boolean;
  clearOnUnmount: boolean;
  startedAt: number;
  status: 'pending' | 'success' | 'error';
  abort: () => void;
  httpStatus?: number;
  error?: unknown;
};

export type ApiObserver = (request: ApiRequest) => void;

export type ApiAuth = {
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<boolean>;
};

export type ApiTask<T> = {
  id: UUID;
  operation: ApiOperation;
  promise: Promise<T>;
  abort: () => void;
};

export type ApiOptions = {
  timeoutMs?: number;
  observers?: readonly ApiObserver[];
};

export type ApiCallOptions = {
  showLoader?: boolean;
  clearOnUnmount?: boolean;
  retryOnUnauthorized?: boolean;
  timeoutMs?: number;
};

type EndpointOptions = {
  auth?: Config['auth'];
  client?: Client;
  meta?: Record<string, unknown>;
  signal?: AbortSignal;
};

type EndpointResult = { error?: unknown; response?: Response };
type Endpoint<TOptions extends EndpointOptions, TResult extends EndpointResult> = (
  options: TOptions,
) => Promise<TResult>;

type BoundOperations<T extends Record<string, unknown>> = {
  [K in keyof T]: T[K] extends (...args: infer Args) => infer Result
    ? (
        options: Omit<NonNullable<Args[0]>, 'client'>,
        callOptions?: ApiCallOptions,
      ) => ApiTask<Awaited<Result>>
    : never;
};

export class BaseApi {
  private readonly runtime: { auth?: ApiAuth };

  constructor(
    readonly client: Client,
    private readonly options: ApiOptions = {},
    runtime: { auth?: ApiAuth } = {},
  ) {
    this.runtime = runtime;
  }

  withTimeout(timeoutMs: number): BaseApi {
    return new BaseApi(this.client, { ...this.options, timeoutMs }, this.runtime);
  }

  withObserver(observer: ApiObserver): BaseApi {
    return new BaseApi(
      this.client,
      {
        ...this.options,
        observers: [...(this.options.observers ?? []), observer],
      },
      this.runtime,
    );
  }

  setAuth(auth: ApiAuth): void {
    this.runtime.auth = auth;
  }

  bind<T extends Partial<Record<ApiOperation, unknown>>>(
    operations: T & Record<Exclude<keyof T, ApiOperation>, never>,
  ): BoundOperations<T> {
    return Object.fromEntries(
      Object.entries(operations).map(([name, endpoint]) => [
        name,
        (options: EndpointOptions, callOptions?: ApiCallOptions) =>
          this.run(
            endpoint as Endpoint<EndpointOptions, EndpointResult>,
            options,
            name as ApiOperation,
            callOptions,
          ),
      ]),
    ) as BoundOperations<T>;
  }

  private run<TOptions extends EndpointOptions, TResult extends EndpointResult>(
    endpoint: Endpoint<TOptions, TResult>,
    options: Omit<TOptions, 'client'>,
    operation: ApiOperation,
    callOptions: ApiCallOptions = {},
  ): ApiTask<TResult> {
    const controller = new AbortController();
    const signals = [controller.signal];
    if (options.signal) {
      signals.push(options.signal);
    }
    const timeoutMs = callOptions.timeoutMs ?? this.options.timeoutMs;
    if (timeoutMs !== undefined) {
      signals.push(AbortSignal.timeout(timeoutMs));
    }
    const signal = AbortSignal.any(signals);
    const request: ApiRequest = {
      id: crypto.randomUUID(),
      operation,
      showLoader: callOptions.showLoader ?? true,
      clearOnUnmount: callOptions.clearOnUnmount ?? true,
      startedAt: performance.now(),
      status: 'pending',
      abort: () => controller.abort(),
    };

    this.notify(request);

    const promise = Promise.resolve()
      .then(() => this.execute(endpoint, options, request.id, operation, signal, callOptions))
      .then(
        (result) => {
          this.notify({
            ...request,
            status: result.error === undefined ? 'success' : 'error',
            httpStatus: result.response?.status,
            error: result.error,
          });
          return result;
        },
        (error: unknown) => {
          this.notify({ ...request, status: 'error', error });
          throw error;
        },
      );

    return { id: request.id, operation, promise, abort: request.abort };
  }

  private async execute<TOptions extends EndpointOptions, TResult extends EndpointResult>(
    endpoint: Endpoint<TOptions, TResult>,
    options: Omit<TOptions, 'client'>,
    requestId: UUID,
    operation: ApiOperation,
    signal: AbortSignal,
    callOptions: ApiCallOptions,
  ): Promise<TResult> {
    const result = await endpoint({
      ...options,
      auth: this.runtime.auth?.getAccessToken,
      client: this.client,
      meta: { ...options.meta, requestId },
      signal,
    } as unknown as TOptions);

    const shouldRetry = callOptions.retryOnUnauthorized ?? !sessionOperations.has(operation);
    const canRefresh =
      shouldRetry &&
      result.response?.status === 401 &&
      this.runtime.auth?.getAccessToken() &&
      this.runtime.auth !== undefined &&
      !signal.aborted;

    if (!canRefresh || !(await this.runtime.auth!.refreshAccessToken()) || signal.aborted) {
      return result;
    }

    return endpoint({
      ...options,
      auth: this.runtime.auth!.getAccessToken,
      client: this.client,
      meta: { ...options.meta, requestId },
      signal,
    } as unknown as TOptions);
  }

  private notify(request: ApiRequest): void {
    for (const observer of this.options.observers ?? []) {
      try {
        observer(request);
      } catch (error) {
        console.error('API observer failed', error);
      }
    }
  }
}
