import { Controller, Get, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { TemplateDto } from './dto/template.dto';
import { TemplatesService } from './templates.service';

@ApiTags('templates')
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templates: TemplatesService) {}

  @Get()
  @ApiOperation({ operationId: 'templateList' })
  @ApiOkResponse({ type: [TemplateDto] })
  findAll() {
    return this.templates.findAll();
  }

  @Get(':slug')
  @ApiOperation({ operationId: 'templateGet' })
  @ApiOkResponse({ type: TemplateDto })
  @ApiNotFoundResponse({ description: 'Шаблон не найден.' })
  findOne(@Param('slug') slug: string) {
    return this.templates.findOne(slug);
  }
}
