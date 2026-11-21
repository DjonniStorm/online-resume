import { ApiProperty } from '@nestjs/swagger';

import { ResumeSummaryDto } from './resume-summary.dto';

export class ResumeOverviewDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  publishedCount!: number;

  @ApiProperty()
  templateCount!: number;

  @ApiProperty({ type: ResumeSummaryDto, nullable: true })
  latestResume!: ResumeSummaryDto | null;
}
