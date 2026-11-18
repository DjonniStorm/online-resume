import { makeObservable, observable, runInAction } from 'mobx';

import type { BaseApi } from '@/shared/api';
import { resumeCreate, resumeDelete, resumeList } from '@/shared/api/generated/sdk.gen';
import type { CreateResumeDto, ResumeSummaryDto } from '@/shared/api/generated/types.gen';

export class ResumeStore {
  resumes: ResumeSummaryDto[] = [];

  private readonly operations;

  constructor(api: BaseApi) {
    this.operations = api.bind({
      create: resumeCreate,
      list: resumeList,
      remove: resumeDelete,
    });
    makeObservable(this, { resumes: observable });
  }

  async load(): Promise<void> {
    const task = this.operations.list({});
    try {
      const result = await task.promise;
      if (!result.data) {
        return;
      }
      runInAction(() => {
        this.resumes = result.data;
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
      await this.load();
      return true;
    } catch {
      return false;
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
      });
      return true;
    } catch {
      return false;
    }
  }

  reload(): Promise<void> {
    return this.load();
  }
}
