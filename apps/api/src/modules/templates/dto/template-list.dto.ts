import { ApiProperty } from '@nestjs/swagger';

import { TemplateDto } from './template.dto';

export class TemplateListDto {
  @ApiProperty({ type: [TemplateDto] })
  items!: TemplateDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}
