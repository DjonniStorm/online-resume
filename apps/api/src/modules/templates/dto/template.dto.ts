import { ApiProperty } from '@nestjs/swagger';

import {
  TemplateFieldType,
  TemplateLayout,
  TemplateRegion,
  TemplateSectionLayout,
  TemplateSpacing,
} from '../../../generated/prisma/enums';
import { ResumeSectionType } from '../../../generated/prisma/enums';

export class TemplateThemeDto {
  @ApiProperty()
  titleFontFamily!: string;

  @ApiProperty()
  bodyFontFamily!: string;

  @ApiProperty({ format: 'decimal' })
  titleSizePt!: string;

  @ApiProperty({ format: 'decimal' })
  sectionTitleSizePt!: string;

  @ApiProperty({ format: 'decimal' })
  bodySizePt!: string;

  @ApiProperty({ format: 'decimal' })
  lineHeight!: string;

  @ApiProperty({ enum: TemplateSpacing })
  spacing!: TemplateSpacing;

  @ApiProperty()
  primaryColor!: string;

  @ApiProperty()
  secondaryColor!: string;

  @ApiProperty()
  textColor!: string;

  @ApiProperty()
  pageColor!: string;

  @ApiProperty({ nullable: true })
  headerColor!: string | null;

  @ApiProperty({ nullable: true })
  sidebarColor!: string | null;
}

export class TemplateSectionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: ResumeSectionType })
  type!: ResumeSectionType;

  @ApiProperty({ enum: TemplateRegion })
  region!: TemplateRegion;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty({ enum: TemplateSectionLayout })
  itemLayout!: TemplateSectionLayout;

  @ApiProperty()
  canReorder!: boolean;

  @ApiProperty()
  showHeading!: boolean;

  @ApiProperty({ nullable: true })
  headingText!: string | null;

  @ApiProperty({ nullable: true })
  accentColor!: string | null;
}

export class TemplateFieldRuleDto {
  @ApiProperty({ enum: TemplateFieldType })
  field!: TemplateFieldType;

  @ApiProperty()
  isRequired!: boolean;
}

export class TemplateSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ enum: TemplateLayout })
  layout!: TemplateLayout;

  @ApiProperty()
  pageWidthMm!: string;

  @ApiProperty()
  pageHeightMm!: string;

  @ApiProperty({ nullable: true })
  sidebarWidthPercent!: number | null;

  @ApiProperty({ nullable: true })
  previewUrl!: string | null;
}

export class TemplateDto extends TemplateSummaryDto {
  @ApiProperty({ type: TemplateThemeDto, nullable: true })
  theme!: TemplateThemeDto | null;

  @ApiProperty({ type: [TemplateSectionDto] })
  sections!: TemplateSectionDto[];

  @ApiProperty({ type: [TemplateFieldRuleDto] })
  fields!: TemplateFieldRuleDto[];
}
