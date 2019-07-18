import { createDatabaseTestingModule } from '../../../test/create-database-testing-module';
import { ResumePhotoStorageService } from '../resume-photo-storage.service';
import { ResumeViewsService } from '../resume-views.service';
import { ResumesService } from '../resumes.service';

export function createResumeTestingModule() {
  return createDatabaseTestingModule({
    providers: [ResumePhotoStorageService, ResumeViewsService, ResumesService],
  });
}
