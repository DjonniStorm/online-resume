import { Controller, Get, Header, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ResumeDto } from './dto/resume-detail.dto';
import { ResumesService } from './resumes.service';

@ApiTags('public-resumes')
@Controller('public/resumes')
export class PublicResumesController {
  constructor(private readonly resumes: ResumesService) {}

  @Get(':slug')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ operationId: 'publicResumeGet' })
  @ApiOkResponse({ type: ResumeDto })
  @ApiNotFoundResponse({ description: 'Резюме недоступно.' })
  findOne(@Param('slug') slug: string) {
    return this.resumes.findPublic(slug);
  }
}
