import { ApiProperty } from '@nestjs/swagger';

import { ResumeSummaryDto } from './resume-summary.dto';

export class ResumeOverviewDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  publishedCount!: number;

  @ApiProperty()
  viewsTotal!: number;

  @ApiProperty()
  viewsLast7Days!: number;

  @ApiProperty({ type: () => [ResumeDailyViewsDto] })
  dailyViews!: ResumeDailyViewsDto[];

  @ApiProperty({ type: ResumeSummaryDto, nullable: true })
  latestResume!: ResumeSummaryDto | null;
}

export class ResumeDailyViewsDto {
  @ApiProperty({ format: 'date' })
  date!: string;

  @ApiProperty()
  count!: number;
}
