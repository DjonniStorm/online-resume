import { ApiProperty } from '@nestjs/swagger';

export class ResumeTemplateSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;
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
