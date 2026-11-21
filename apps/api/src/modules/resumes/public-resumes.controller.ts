import { Controller, Get, Header, Param, StreamableFile } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';

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

  @Get(':slug/photo')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ operationId: 'publicResumePhotoGet' })
  @ApiProduces('image/jpeg', 'image/png', 'image/webp')
  @ApiOkResponse({ schema: { type: 'string', format: 'binary' } })
  @ApiNotFoundResponse({ description: 'Фотография не найдена.' })
  async getPhoto(@Param('slug') slug: string) {
    const photo = await this.resumes.getPublicPhoto(slug);
    return new StreamableFile(photo.data, { type: photo.type });
  }
}
