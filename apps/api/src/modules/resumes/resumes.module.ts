import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PublicResumesController } from './public-resumes.controller';
import { ResumeCleanupService } from './resume-cleanup.service';
import { ResumePhotoStorageService } from './resume-photo-storage.service';
import { ResumeViewsService } from './resume-views.service';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';

@Module({
  imports: [AuthModule],
  controllers: [ResumesController, PublicResumesController],
  providers: [ResumesService, ResumePhotoStorageService, ResumeViewsService, ResumeCleanupService],
})
export class ResumesModule {}
