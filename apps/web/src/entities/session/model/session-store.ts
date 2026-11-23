import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import type { BaseApi, UUID } from '@/shared/api';
import { authLogin, authLogout, authRefresh, authRegister } from '@/shared/api/generated/sdk.gen';
import type {
  AuthResultDto,
  CreateUserDto,
  LoginDto,
  PublicUserDto,
} from '@/shared/api/generated/types.gen';

type RequestReader = {
  isLatest: (operation: string, id: UUID) => boolean;
  latest: (operation: string) => { status: 'pending' | 'success' | 'error' } | undefined;
};

type ErrorReader = {
  forOperation: (operation: string) => { error: unknown; status?: number } | undefined;
};

export class SessionStore {
  accessToken: string | null = null;
  user: PublicUserDto | null = null;
  ready = false;

  private readonly operations;
  private authQueue = Promise.resolve();
  private refreshPromise: Promise<boolean> | null = null;
  private restorePromise: Promise<void> | null = null;
  private sessionRevision = 0;

  constructor(
    api: BaseApi,
    private readonly requests: RequestReader,
    private readonly errors: ErrorReader,
  ) {
    this.operations = api.bind({
      login: authLogin,
      register: authRegister,
      refresh: authRefresh,
      logout: authLogout,
    });
    makeObservable(this, {
      accessToken: observable,
      user: observable,
      ready: observable,
      loginError: computed,
      loginLoading: computed,
      registerError: computed,
      registerLoading: computed,
      registerStatus: computed,
      setSession: action,
    });
  }

  get loginError(): string | null {
    const failure = this.errors.forOperation('session.login');
    if (!failure) {
      return null;
    }
    return failure.status === 401
      ? 'Неверный email или пароль'
      : 'Не удалось войти. Попробуйте ещё раз';
  }

  get loginLoading(): boolean {
    return this.requests.latest('session.login')?.status === 'pending';
  }

  get registerError(): string | null {
    const failure = this.errors.forOperation('session.register');
    if (!failure) {
      return null;
    }
    return failure.status === 409 ? null : 'Не удалось создать аккаунт. Попробуйте ещё раз';
  }

  get registerLoading(): boolean {
    return this.requests.latest('session.register')?.status === 'pending';
  }

  get registerStatus(): number | undefined {
    return this.errors.forOperation('session.register')?.status;
  }

  restore(): Promise<void> {
    this.restorePromise ??= this.restoreSession();
    return this.restorePromise;
  }

  setSession(result: AuthResultDto): void {
    this.accessToken = result.accessToken;
    this.user = result.user;
    this.ready = true;
  }

  async login(body: LoginDto): Promise<boolean> {
    await this.restore();
    return this.enqueue(async () => {
      const revision = ++this.sessionRevision;
      const task = this.operations.login({ body });
      try {
        const result = await task.promise;
        if (
          revision !== this.sessionRevision ||
          !this.requests.isLatest(task.operation, task.id) ||
          !result.data
        ) {
          return false;
        }
        runInAction(() => this.setSession(result.data));
        return true;
      } catch {
        return false;
      }
    });
  }

  async register(body: CreateUserDto): Promise<boolean> {
    await this.restore();
    return this.enqueue(async () => {
      const revision = ++this.sessionRevision;
      const task = this.operations.register({ body });
      try {
        const result = await task.promise;
        if (
          revision !== this.sessionRevision ||
          !this.requests.isLatest(task.operation, task.id) ||
          !result.data
        ) {
          return false;
        }
        runInAction(() => this.setSession(result.data));
        return true;
      } catch {
        return false;
      }
    });
  }

  async logout(): Promise<void> {
    await this.restore();
    return this.enqueue(async () => {
      const revision = ++this.sessionRevision;
      const task = this.operations.logout({});
      const result = await task.promise;
      if (result.response?.status !== 204) {
        throw new Error('Не удалось выйти из аккаунта');
      }
      if (revision === this.sessionRevision) {
        runInAction(() => {
          this.accessToken = null;
          this.user = null;
        });
      }
    });
  }

  refreshAccessToken(): Promise<boolean> {
    this.refreshPromise ??= this.enqueue(() => this.requestRefresh()).finally(() => {
      this.refreshPromise = null;
    });
    return this.refreshPromise;
  }

  private async restoreSession(): Promise<void> {
    try {
      await this.refreshAccessToken();
    } catch {
      // The visitor may have no active session.
    } finally {
      runInAction(() => {
        this.ready = true;
      });
    }
  }

  private async requestRefresh(): Promise<boolean> {
    const task = this.operations.refresh({}, { showLoader: false, clearOnUnmount: false });
    try {
      const result = await task.promise;
      if (!result.data || !this.requests.isLatest(task.operation, task.id)) {
        runInAction(() => this.clearSession());
        return false;
      }
      runInAction(() => this.setSession(result.data));
      return true;
    } catch {
      runInAction(() => this.clearSession());
      return false;
    }
  }

  private clearSession(): void {
    this.accessToken = null;
    this.user = null;
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const next = this.authQueue.then(operation, operation);
    this.authQueue = next.then(
      () => undefined,
      () => undefined,
    );
    return next;
  }
}
