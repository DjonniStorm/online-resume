import { ApiProperty } from '@nestjs/swagger';

export class ResumePublicationDto {
  @ApiProperty()
  publicSlug!: string;
}
