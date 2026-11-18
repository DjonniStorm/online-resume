import { makeObservable, observable, runInAction } from 'mobx';

import type { BaseApi } from '@/shared/api';
import {
  resumeCreate,
  resumeDelete,
  resumeGet,
  resumeList,
  resumeTemplateChange,
  resumeUpdate,
} from '@/shared/api/generated/sdk.gen';
import type {
  ChangeResumeTemplateDto,
  CreateResumeDto,
  ResumeDto,
  ResumeSummaryDto,
  UpdateResumeDto,
} from '@/shared/api/generated/types.gen';

export class ResumeStore {
  resumes: ResumeSummaryDto[] = [];
  total = 0;
  page = 1;
  limit = 10;
  search = '';

  private readonly operations;
  private loadSequence = 0;

  constructor(api: BaseApi) {
    this.operations = api.bind({
      create: resumeCreate,
      get: resumeGet,
      list: resumeList,
      remove: resumeDelete,
      changeTemplate: resumeTemplateChange,
      update: resumeUpdate,
    });
    makeObservable(this, {
      resumes: observable,
      total: observable,
      page: observable,
      limit: observable,
      search: observable,
    });
  }

  async load(page = this.page): Promise<void> {
    const sequence = ++this.loadSequence;
    const task = this.operations.list({ query: { page, limit: this.limit, search: this.search } });
    try {
      const result = await task.promise;
      if (!result.data || sequence !== this.loadSequence) {
        return;
      }
      runInAction(() => {
        this.resumes = result.data.items;
        this.total = result.data.total;
        this.page = result.data.page;
      });
    } catch {
      // ErrorStore reads the failed request from RequestStore.
    }
  }

  async create(input: CreateResumeDto): Promise<boolean> {
    const task = this.operations.create({ body: input });
    try {
      const result = await task.promise;
      if (result.response?.status !== 201) {
        return false;
      }
      await this.load(1);
      return true;
    } catch {
      return false;
    }
  }

  async get(id: string): Promise<ResumeDto | null> {
    const task = this.operations.get({ path: { id } });
    try {
      const result = await task.promise;
      return result.data ?? null;
    } catch {
      return null;
    }
  }

  async update(id: string, input: UpdateResumeDto): Promise<ResumeDto | null> {
    const task = this.operations.update({ path: { id }, body: input });
    try {
      const result = await task.promise;
      return result.data ?? null;
    } catch {
      return null;
    }
  }

  async changeTemplate(id: string, input: ChangeResumeTemplateDto): Promise<ResumeDto | null> {
    const task = this.operations.changeTemplate({ path: { id }, body: input });
    try {
      const result = await task.promise;
      return result.data ?? null;
    } catch {
      return null;
    }
  }

  async remove(id: string): Promise<boolean> {
    const task = this.operations.remove({ path: { id } });
    try {
      const result = await task.promise;
      if (result.response?.status !== 204) {
        return false;
      }
      runInAction(() => {
        this.resumes = this.resumes.filter((resume) => resume.id !== id);
        this.total = Math.max(0, this.total - 1);
      });
      if (this.resumes.length === 0 && this.page > 1) {
        await this.load(this.page - 1);
      }
      return true;
    } catch {
      return false;
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
}
