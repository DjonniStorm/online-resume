import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PublicResumesController } from './public-resumes.controller';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';

@Module({
  imports: [AuthModule],
  controllers: [ResumesController, PublicResumesController],
  providers: [ResumesService],
})
export class ResumesModule {}
