import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { Controller, Get, Header, Param, Req, Res, StreamableFile } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';

import { ResumeDto } from './dto/resume-detail.dto';
import { ResumeViewsService } from './resume-views.service';
import { ResumesService } from './resumes.service';

const visitorCookie = 'resume_visitor';
const visitorKeyPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// Max-Age задаётся в секундах: 365 дней = 31 536 000 секунд.
const visitorCookieMaxAgeSeconds = 365 * 24 * 60 * 60;

@ApiTags('public-resumes')
@Controller('public/resumes')
export class PublicResumesController {
  constructor(
    private readonly resumes: ResumesService,
    private readonly views: ResumeViewsService,
  ) {}

  @Get(':slug')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ operationId: 'publicResumeGet' })
  @ApiOkResponse({ type: ResumeDto })
  @ApiNotFoundResponse({ description: 'Резюме недоступно.' })
  async findOne(
    @Param('slug') slug: string,
    @Req() request: IncomingMessage,
    @Res({ passthrough: true }) response: ServerResponse,
  ) {
    const resume = await this.resumes.findPublic(slug);
    const visitorKey = readVisitorKey(request.headers.cookie) ?? randomUUID();
    response.setHeader(
      'Set-Cookie',
      `${visitorCookie}=${visitorKey}; Max-Age=${visitorCookieMaxAgeSeconds}; Path=/api/public/resumes; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
    );
    await this.views.record(resume.id, visitorKey);
    return resume;
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

function readVisitorKey(cookieHeader: string | undefined): string | null {
  const value = cookieHeader
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${visitorCookie}=`))
    ?.slice(visitorCookie.length + 1);
  return value && visitorKeyPattern.test(value) ? value : null;
}
