import { makeObservable, observable, runInAction } from 'mobx';

import type { BaseApi } from '@/shared/api';
import { templateList } from '@/shared/api/generated/sdk.gen';
import type { TemplateDto } from '@/shared/api/generated/types.gen';

export class TemplateStore {
  templates: TemplateDto[] = [];

  private readonly operations;

  constructor(api: BaseApi) {
    this.operations = api.bind({ list: templateList });
    makeObservable(this, { templates: observable });
  }

  async load(): Promise<void> {
    const task = this.operations.list({});
    try {
      const result = await task.promise;
      if (!result.data) {
        return;
      }
      runInAction(() => {
        this.templates = result.data;
      });
    } catch {
      // ErrorStore reads the failed request from RequestStore.
    }
  }

  reload(): Promise<void> {
    return this.load();
  }
}
