import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { TemplateListQueryDto } from './dto/template-list-query.dto';
import { TemplateListDto } from './dto/template-list.dto';
import { TemplateDto } from './dto/template.dto';
import { TemplatesService } from './templates.service';

@ApiTags('templates')
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templates: TemplatesService) {}

  @Get()
  @ApiOperation({ operationId: 'templateList' })
  @ApiOkResponse({ type: TemplateListDto })
  findAll(@Query() query: TemplateListQueryDto) {
    return this.templates.findAll(query);
  }

  @Get(':slug')
  @ApiOperation({ operationId: 'templateGet' })
  @ApiOkResponse({ type: TemplateDto })
  @ApiNotFoundResponse({ description: 'Шаблон не найден.' })
  findOne(@Param('slug') slug: string) {
    return this.templates.findOne(slug);
  }
}
