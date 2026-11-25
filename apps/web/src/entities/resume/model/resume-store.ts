import { makeObservable, observable, runInAction } from 'mobx';

import { ApiOperation, type BaseApi } from '@/shared/api';
import {
  publicResumeGet,
  resumeCancelDelete,
  resumeCancelUnpublish,
  resumeCreate,
  resumeDelete,
  resumeDeletionNotices,
  resumeDeletionNoticesDismiss,
  resumeGet,
  resumeList,
  resumeOverview,
  resumePhotoDelete,
  resumePhotoGet,
  resumePhotoUpload,
  resumePublish,
  resumeScheduleDelete,
  resumeScheduleUnpublish,
  resumeTemplateChange,
  resumeUnpublish,
  resumeUpdate,
} from '@/shared/api/generated/sdk.gen';
import type {
  ChangeResumeTemplateDto,
  CreateResumeDto,
  ResumeDeletionNoticeDto,
  ResumeDto,
  ResumeOverviewDto,
  ResumeSummaryDto,
  UpdateResumeDto,
} from '@/shared/api/generated/types.gen';

export class ResumeStore {
  resumes: ResumeSummaryDto[] = [];
  overview: ResumeOverviewDto | null = null;
  deletionNotices: ResumeDeletionNoticeDto[] = [];
  total = 0;
  page = 1;
  limit = 10;
  search = '';

  private readonly operations;
  private loadSequence = 0;
  private deletionNoticesSequence = 0;
  private overviewSequence = 0;

  constructor(api: BaseApi) {
    this.operations = api.bind({
      [ApiOperation.ResumesCreate]: resumeCreate,
      [ApiOperation.ResumesGetPublic]: publicResumeGet,
      [ApiOperation.ResumesGet]: resumeGet,
      [ApiOperation.ResumesList]: resumeList,
      [ApiOperation.ResumesAnalyticsOptions]: resumeList,
      [ApiOperation.ResumesOverview]: resumeOverview,
      [ApiOperation.ResumesDeletePhoto]: resumePhotoDelete,
      [ApiOperation.ResumesGetPhoto]: resumePhotoGet,
      [ApiOperation.ResumesUploadPhoto]: resumePhotoUpload,
      [ApiOperation.ResumesRemove]: resumeDelete,
      [ApiOperation.ResumesDeletionNotices]: resumeDeletionNotices,
      [ApiOperation.ResumesDismissDeletionNotices]: resumeDeletionNoticesDismiss,
      [ApiOperation.ResumesPublish]: resumePublish,
      [ApiOperation.ResumesScheduleUnpublish]: resumeScheduleUnpublish,
      [ApiOperation.ResumesCancelUnpublish]: resumeCancelUnpublish,
      [ApiOperation.ResumesScheduleDelete]: resumeScheduleDelete,
      [ApiOperation.ResumesCancelDelete]: resumeCancelDelete,
      [ApiOperation.ResumesUnpublish]: resumeUnpublish,
      [ApiOperation.ResumesChangeTemplate]: resumeTemplateChange,
      [ApiOperation.ResumesUpdate]: resumeUpdate,
    });
    makeObservable(this, {
      resumes: observable,
      overview: observable,
      deletionNotices: observable,
      total: observable,
      page: observable,
      limit: observable,
      search: observable,
    });
  }

  async load(page = this.page): Promise<void> {
    const sequence = ++this.loadSequence;
    const task = this.operations[ApiOperation.ResumesList](
      { query: { page, limit: this.limit, search: this.search } },
      { showLoader: false },
    );
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

  async loadOverview(resumeId?: string | null): Promise<void> {
    const sequence = ++this.overviewSequence;
    const task = this.operations[ApiOperation.ResumesOverview](
      { query: resumeId ? { resumeId } : undefined },
      { showLoader: false },
    );
    try {
      const result = await task.promise;
      if (result.data && sequence === this.overviewSequence) {
        runInAction(() => {
          this.overview = result.data;
        });
      }
    } catch {
      // ErrorStore reads the failed request from RequestStore.
    }
  }

  async searchAnalyticsOptions(search: string): Promise<ResumeSummaryDto[]> {
    const task = this.operations[ApiOperation.ResumesAnalyticsOptions](
      { query: { page: 1, limit: 10, search } },
      { showLoader: false },
    );
    try {
      const result = await task.promise;
      return result.data?.items ?? [];
    } catch {
      return [];
    }
  }

  async create(input: CreateResumeDto): Promise<boolean> {
    const task = this.operations[ApiOperation.ResumesCreate]({ body: input });
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
    const task = this.operations[ApiOperation.ResumesGet]({ path: { id } });
    try {
      const result = await task.promise;
      return result.data ?? null;
    } catch {
      return null;
    }
  }

  async getPublic(slug: string): Promise<ResumeDto | null> {
    const task = this.operations[ApiOperation.ResumesGetPublic](
      { path: { slug } },
      { retryOnUnauthorized: false },
    );
    try {
      const result = await task.promise;
      return result.data ?? null;
    } catch {
      return null;
    }
  }

  async getPhoto(id: string): Promise<Blob | null> {
    const task = this.operations[ApiOperation.ResumesGetPhoto]({ path: { id }, parseAs: 'blob' });
    try {
      const result = await task.promise;
      return result.data ?? null;
    } catch {
      return null;
    }
  }

  async uploadPhoto(id: string, file: File): Promise<ResumeDto | null> {
    const task = this.operations[ApiOperation.ResumesUploadPhoto]({ path: { id }, body: { file } });
    try {
      const result = await task.promise;
      return result.data ?? null;
    } catch {
      return null;
    }
  }

  async deletePhoto(id: string): Promise<ResumeDto | null> {
    const task = this.operations[ApiOperation.ResumesDeletePhoto]({ path: { id } });
    try {
      const result = await task.promise;
      return result.data ?? null;
    } catch {
      return null;
    }
  }

  async publish(id: string): Promise<string | null> {
    const task = this.operations[ApiOperation.ResumesPublish]({ path: { id } });
    try {
      const result = await task.promise;
      return result.data?.publicSlug ?? null;
    } catch {
      return null;
    }
  }

  async unpublish(id: string): Promise<boolean> {
    const task = this.operations[ApiOperation.ResumesUnpublish]({ path: { id } });
    try {
      const result = await task.promise;
      return result.response?.status === 204;
    } catch {
      return false;
    }
  }

  async scheduleUnpublish(id: string): Promise<string | null> {
    const task = this.operations[ApiOperation.ResumesScheduleUnpublish]({ path: { id } });
    try {
      const result = await task.promise;
      return result.data?.scheduledFor ?? null;
    } catch {
      return null;
    }
  }

  async cancelUnpublish(id: string): Promise<boolean> {
    const task = this.operations[ApiOperation.ResumesCancelUnpublish]({ path: { id } });
    try {
      return (await task.promise).response?.status === 204;
    } catch {
      return false;
    }
  }

  async scheduleDelete(id: string): Promise<boolean> {
    const task = this.operations[ApiOperation.ResumesScheduleDelete]({ path: { id } });
    try {
      const result = await task.promise;
      if (!result.data) return false;
      await this.load();
      return true;
    } catch {
      return false;
    }
  }

  async cancelDelete(id: string): Promise<boolean> {
    const task = this.operations[ApiOperation.ResumesCancelDelete]({ path: { id } });
    try {
      if ((await task.promise).response?.status !== 204) return false;
      await this.load();
      return true;
    } catch {
      return false;
    }
  }

  async update(id: string, input: UpdateResumeDto): Promise<ResumeDto | null> {
    const task = this.operations[ApiOperation.ResumesUpdate]({ path: { id }, body: input });
    try {
      const result = await task.promise;
      return result.data ?? null;
    } catch {
      return null;
    }
  }

  async changeTemplate(id: string, input: ChangeResumeTemplateDto): Promise<ResumeDto | null> {
    const task = this.operations[ApiOperation.ResumesChangeTemplate]({ path: { id }, body: input });
    try {
      const result = await task.promise;
      return result.data ?? null;
    } catch {
      return null;
    }
  }

  async remove(id: string): Promise<boolean> {
    const task = this.operations[ApiOperation.ResumesRemove]({ path: { id } });
    try {
      const result = await task.promise;
      if (result.response?.status !== 204) {
        return false;
      }
      await this.load();
      await this.loadDeletionNotices();
      return true;
    } catch {
      return false;
    }
  }

  async loadDeletionNotices(): Promise<void> {
    const sequence = ++this.deletionNoticesSequence;
    const task = this.operations[ApiOperation.ResumesDeletionNotices](
      {},
      { clearOnUnmount: false },
    );
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
    const task = this.operations[ApiOperation.ResumesDismissDeletionNotices](
      {},
      { clearOnUnmount: false },
    );
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
