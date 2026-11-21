import { ResumeStore } from '@/entities/resume';
import { SessionStore } from '@/entities/session/model/session-store';
import { TemplateStore } from '@/entities/template';
import { createApi } from '@/shared/api';

import { ErrorStore } from './error-store';
import { LoaderStore } from './loader-store';
import { RequestStore } from './request-store';
import { StoreKey } from './store-key';

export class RootStore {
  readonly requests = new RequestStore();
  readonly loader = new LoaderStore(this.requests);
  readonly errors = new ErrorStore(this.requests);
  readonly api = createApi({
    clientConfig: { credentials: 'include' },
    timeoutMs: 10_000,
    logging: import.meta.env.DEV,
    observers: [this.requests.track],
  });
  readonly session = new SessionStore(
    this.api.forStore(StoreKey.Session),
    this.requests,
    this.errors,
  );
  readonly templates = new TemplateStore(this.api.forStore(StoreKey.Templates));
  readonly resumes = new ResumeStore(this.api.forStore(StoreKey.Resumes));

  constructor() {
    this.api.setAuth({
      getAccessToken: () => this.session.accessToken,
      refreshAccessToken: () => this.session.refreshAccessToken(),
    });
  }

  get<K extends StoreKey>(key: K): this[K] {
    return this[key];
  }

  getAll<const K extends readonly StoreKey[]>(...keys: K): Pick<this, K[number]> {
    return Object.fromEntries(keys.map((key) => [key, this[key]])) as Pick<this, K[number]>;
  }
}
