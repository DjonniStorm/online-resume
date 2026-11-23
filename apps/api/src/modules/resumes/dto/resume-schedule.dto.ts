import { ApiProperty } from '@nestjs/swagger';

export class ResumeScheduleDto {
  @ApiProperty({ format: 'date-time' })
  scheduledFor!: Date;
}
