import { makeObservable, observable, runInAction } from 'mobx';

import { ApiOperation, type BaseApi } from '@/shared/api';
import { templateList } from '@/shared/api/generated/sdk.gen';
import type { TemplateDto } from '@/shared/api/generated/types.gen';

export const TEMPLATE_PAGE_SIZES = [3, 6, 9, 12] as const;
const DEFAULT_TEMPLATE_PAGE_SIZE = TEMPLATE_PAGE_SIZES[0];

export class TemplateStore {
  templates: TemplateDto[] = [];
  total = 0;
  page = 1;
  limit: number = DEFAULT_TEMPLATE_PAGE_SIZE;
  search = '';

  private readonly operations;
  private loadSequence = 0;

  constructor(api: BaseApi) {
    this.operations = api.bind({ [ApiOperation.TemplatesList]: templateList });
    makeObservable(this, {
      templates: observable,
      total: observable,
      page: observable,
      limit: observable,
      search: observable,
    });
  }

  async load(page = this.page): Promise<void> {
    const sequence = ++this.loadSequence;
    const task = this.operations[ApiOperation.TemplatesList](
      { query: { page, limit: this.limit, search: this.search } },
      { showLoader: false },
    );
    try {
      const result = await task.promise;
      if (!result.data || sequence !== this.loadSequence) {
        return;
      }
      runInAction(() => {
        this.templates = result.data.items;
        this.total = result.data.total;
        this.page = result.data.page;
      });
    } catch {
      // Ошибка запроса отображается через ErrorStore.
    }
  }

  reload(): Promise<void> {
    return this.load();
  }

  searchFor(value: string): Promise<void> {
    runInAction(() => {
      this.search = value;
    });
    return this.load(1);
  }

  setPageSize(value: number): Promise<void> {
    runInAction(() => {
      this.limit = value;
    });
    return this.load(1);
  }

  openSelection(): Promise<void> {
    runInAction(() => {
      this.search = '';
      this.limit = DEFAULT_TEMPLATE_PAGE_SIZE;
    });
    return this.load(1);
  }
}
