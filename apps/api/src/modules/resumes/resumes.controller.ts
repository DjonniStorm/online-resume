import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/common/current-user.decorator';
import type { AuthenticatedUser } from '../auth/common/types';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
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
