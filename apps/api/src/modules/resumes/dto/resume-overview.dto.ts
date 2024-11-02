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

  @ApiProperty({ type: () => SelectedResumeDto, nullable: true })
  selectedResume!: SelectedResumeDto | null;

  @ApiProperty({ type: ResumeSummaryDto, nullable: true })
  latestResume!: ResumeSummaryDto | null;

  @ApiProperty({ type: () => [ResumeScheduledLinkDto] })
  scheduledLinks!: ResumeScheduledLinkDto[];
}

export class ResumeScheduledLinkDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty({ enum: ['unpublish', 'delete'] }) kind!: 'unpublish' | 'delete';
  @ApiProperty({ format: 'date-time' }) scheduledFor!: Date;
}

export class SelectedResumeDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;
}

export class ResumeDailyViewsDto {
  @ApiProperty({ format: 'date' })
  date!: string;

  @ApiProperty()
  count!: number;
}
