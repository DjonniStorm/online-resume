import { makeObservable, observable, runInAction } from 'mobx';

import type { BaseApi } from '@/shared/api';
import {
  publicResumeGet,
  resumeCreate,
  resumeDelete,
  resumeDeletionNotices,
  resumeDeletionNoticesDismiss,
  resumeGet,
  resumeList,
  resumePhotoDelete,
  resumePhotoGet,
  resumePhotoUpload,
  resumePublish,
  resumeTemplateChange,
  resumeUnpublish,
  resumeUpdate,
} from '@/shared/api/generated/sdk.gen';
import type {
  ChangeResumeTemplateDto,
  CreateResumeDto,
  ResumeDeletionNoticeDto,
  ResumeDto,
  ResumeSummaryDto,
  UpdateResumeDto,
} from '@/shared/api/generated/types.gen';

export class ResumeStore {
  resumes: ResumeSummaryDto[] = [];
  deletionNotices: ResumeDeletionNoticeDto[] = [];
  total = 0;
  page = 1;
  limit = 10;
  search = '';

  private readonly operations;
  private loadSequence = 0;
  private deletionNoticesSequence = 0;

  constructor(api: BaseApi) {
    this.operations = api.bind({
      create: resumeCreate,
      getPublic: publicResumeGet,
      get: resumeGet,
      list: resumeList,
      deletePhoto: resumePhotoDelete,
      getPhoto: resumePhotoGet,
      uploadPhoto: resumePhotoUpload,
      remove: resumeDelete,
      deletionNotices: resumeDeletionNotices,
      dismissDeletionNotices: resumeDeletionNoticesDismiss,
      publish: resumePublish,
      unpublish: resumeUnpublish,
      changeTemplate: resumeTemplateChange,
      update: resumeUpdate,
    });
    makeObservable(this, {
      resumes: observable,
      deletionNotices: observable,
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

  async getPublic(slug: string): Promise<ResumeDto | null> {
    const task = this.operations.getPublic({ path: { slug } }, { retryOnUnauthorized: false });
    try {
      const result = await task.promise;
      return result.data ?? null;
    } catch {
      return null;
    }
  }

  async getPhoto(id: string): Promise<Blob | null> {
    const task = this.operations.getPhoto({ path: { id }, parseAs: 'blob' });
    try {
      const result = await task.promise;
      return result.data ?? null;
    } catch {
      return null;
    }
  }

  async uploadPhoto(id: string, file: File): Promise<ResumeDto | null> {
    const task = this.operations.uploadPhoto({ path: { id }, body: { file } });
    try {
      const result = await task.promise;
      return result.data ?? null;
    } catch {
      return null;
    }
  }

  async deletePhoto(id: string): Promise<ResumeDto | null> {
    const task = this.operations.deletePhoto({ path: { id } });
    try {
      const result = await task.promise;
      return result.data ?? null;
    } catch {
      return null;
    }
  }

  async publish(id: string): Promise<string | null> {
    const task = this.operations.publish({ path: { id } });
    try {
      const result = await task.promise;
      return result.data?.publicSlug ?? null;
    } catch {
      return null;
    }
  }

  async unpublish(id: string): Promise<boolean> {
    const task = this.operations.unpublish({ path: { id } });
    try {
      const result = await task.promise;
      return result.response?.status === 204;
    } catch {
      return false;
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
      await this.loadDeletionNotices();
      return true;
    } catch {
      return false;
    }
  }

  async loadDeletionNotices(): Promise<void> {
    const sequence = ++this.deletionNoticesSequence;
    const task = this.operations.deletionNotices({}, { clearOnUnmount: false });
    try {
      const result = await task.promise;
      if (result.data && sequence === this.deletionNoticesSequence) {
        runInAction(() => {
          this.deletionNotices = result.data ?? [];
        });
      }
    } catch {
      // ErrorStore reads the failed request from RequestStore.
    }
  }

  async dismissDeletionNotices(): Promise<void> {
    const task = this.operations.dismissDeletionNotices({}, { clearOnUnmount: false });
    try {
      const result = await task.promise;
      if (result.response?.status === 204) {
        this.deletionNoticesSequence += 1;
        runInAction(() => {
          this.deletionNotices = [];
        });
      }
    } catch {
      // ErrorStore reads the failed request from RequestStore.
    }
  }

  clearDeletionNotices(): void {
    this.deletionNoticesSequence += 1;
    runInAction(() => {
      this.deletionNotices = [];
    });
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
