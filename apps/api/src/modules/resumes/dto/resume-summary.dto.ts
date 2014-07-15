import { ApiProperty } from '@nestjs/swagger';

import { TemplateLayout } from '../../../generated/prisma/enums';

export class ResumeTemplateThemeSummaryDto {
  @ApiProperty()
  primaryColor!: string;

  @ApiProperty()
  pageColor!: string;

  @ApiProperty({ nullable: true })
  headerColor!: string | null;

  @ApiProperty({ nullable: true })
  sidebarColor!: string | null;
}

export class ResumeTemplateSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: TemplateLayout })
  layout!: TemplateLayout;

  @ApiProperty({ type: ResumeTemplateThemeSummaryDto, nullable: true })
  theme!: ResumeTemplateThemeSummaryDto | null;
}

export class ResumeSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty({ nullable: true })
  headline!: string | null;

  @ApiProperty()
  isPublished!: boolean;

  @ApiProperty({ type: ResumeTemplateSummaryDto })
  template!: ResumeTemplateSummaryDto;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class ResumeListDto {
  @ApiProperty({ type: [ResumeSummaryDto] })
  items!: ResumeSummaryDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}
