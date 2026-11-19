import { ApiProperty } from '@nestjs/swagger';

export class ResumeDeletionNoticeDto {
  @ApiProperty()
  resumeId!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ format: 'date-time' })
  deleteAfter!: string;
}
