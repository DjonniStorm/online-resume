import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/common/current-user.decorator';
import type { AuthenticatedUser } from '../auth/common/types';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { MAX_PHOTO_SIZE, type UploadedPhoto } from './common/photo';
import { ChangeResumeTemplateDto } from './dto/change-resume-template.dto';
import { CreateResumeDto } from './dto/create-resume.dto';
import { ResumeDto } from './dto/resume-detail.dto';
import { ResumeListQueryDto } from './dto/resume-list-query.dto';
import { ResumePublicationDto } from './dto/resume-publication.dto';
import { ResumeListDto } from './dto/resume-summary.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ResumesService } from './resumes.service';

@ApiTags('resumes')
@ApiBearerAuth()
@ApiUnauthorizedResponse()
@UseGuards(AccessTokenGuard)
@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumes: ResumesService) {}

  @Post()
  @ApiOperation({ operationId: 'resumeCreate' })
  @ApiCreatedResponse({ type: ResumeDto })
  @ApiNotFoundResponse({ description: 'Активный шаблон не найден.' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() input: CreateResumeDto) {
    return this.resumes.create(user.id, input);
  }

  @Get()
  @ApiOperation({ operationId: 'resumeList' })
  @ApiOkResponse({ type: ResumeListDto })
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: ResumeListQueryDto) {
    return this.resumes.findAll(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ operationId: 'resumeGet' })
  @ApiOkResponse({ type: ResumeDto })
  @ApiNotFoundResponse({ description: 'Резюме не найдено.' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.resumes.findOne(user.id, id);
  }

  @Get(':id/photo')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ operationId: 'resumePhotoGet' })
  @ApiProduces('image/jpeg', 'image/png', 'image/webp')
  @ApiOkResponse({ schema: { type: 'string', format: 'binary' } })
  @ApiNotFoundResponse({ description: 'Фотография не найдена.' })
  async getPhoto(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const photo = await this.resumes.getPhoto(user.id, id);
    return new StreamableFile(photo.data, { type: photo.type });
  }

  @Post(':id/photo')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_PHOTO_SIZE, files: 1 } }))
  @ApiOperation({ operationId: 'resumePhotoUpload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOkResponse({ type: ResumeDto })
  @ApiNotFoundResponse({ description: 'Резюме не найдено.' })
  uploadPhoto(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @UploadedFile() file: UploadedPhoto | undefined,
  ) {
    return this.resumes.uploadPhoto(user.id, id, file);
  }

  @Delete(':id/photo')
  @ApiOperation({ operationId: 'resumePhotoDelete' })
  @ApiOkResponse({ type: ResumeDto })
  @ApiNotFoundResponse({ description: 'Резюме не найдено.' })
  removePhoto(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.resumes.removePhoto(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ operationId: 'resumeUpdate' })
  @ApiOkResponse({ type: ResumeDto })
  @ApiNotFoundResponse({ description: 'Резюме не найдено.' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() input: UpdateResumeDto,
  ) {
    return this.resumes.update(user.id, id, input);
  }

  @Patch(':id/template')
  @ApiOperation({ operationId: 'resumeTemplateChange' })
  @ApiOkResponse({ type: ResumeDto })
  @ApiNotFoundResponse({ description: 'Резюме или шаблон не найдены.' })
  changeTemplate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() input: ChangeResumeTemplateDto,
  ) {
    return this.resumes.changeTemplate(user.id, id, input);
  }

  @Post(':id/publish')
  @HttpCode(200)
  @ApiOperation({ operationId: 'resumePublish' })
  @ApiOkResponse({ type: ResumePublicationDto })
  @ApiNotFoundResponse({ description: 'Резюме не найдено.' })
  publish(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.resumes.publish(user.id, id);
  }

  @Delete(':id/publish')
  @HttpCode(204)
  @ApiOperation({ operationId: 'resumeUnpublish' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Резюме не найдено.' })
  unpublish(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.resumes.unpublish(user.id, id);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ operationId: 'resumeDelete' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Резюме не найдено.' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.resumes.remove(user.id, id);
  }
}
