import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
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
import { CreateResumeDto } from './dto/create-resume.dto';
import { ResumeListQueryDto } from './dto/resume-list-query.dto';
import { ResumeListDto } from './dto/resume-summary.dto';
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
  @ApiCreatedResponse()
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
  @ApiOkResponse()
  @ApiNotFoundResponse({ description: 'Резюме не найдено.' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.resumes.findOne(user.id, id);
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
