import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ResumeSectionType } from '../../../generated/prisma/enums';
import { TemplateDto } from '../../templates/dto/template.dto';

class ResumeSectionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: ResumeSectionType })
  type!: ResumeSectionType;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty()
  isVisible!: boolean;
}

class ResumeExperienceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  company!: string;

  @ApiProperty()
  position!: string;

  @ApiProperty({ nullable: true })
  location!: string | null;

  @ApiPropertyOptional({ format: 'date', nullable: true })
  startDate!: string | null;

  @ApiPropertyOptional({ format: 'date', nullable: true })
  endDate!: string | null;

  @ApiProperty()
  isCurrent!: boolean;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty()
  sortOrder!: number;
}

class ResumeEducationDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  institution!: string;

  @ApiProperty({ nullable: true })
  degree!: string | null;

  @ApiProperty({ nullable: true })
  fieldOfStudy!: string | null;

  @ApiProperty({ nullable: true })
  location!: string | null;

  @ApiPropertyOptional({ format: 'date', nullable: true })
  startDate!: string | null;

  @ApiPropertyOptional({ format: 'date', nullable: true })
  endDate!: string | null;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty()
  sortOrder!: number;
}

class ResumeSkillDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  level!: string | null;

  @ApiProperty()
  sortOrder!: number;
}

class ResumeLanguageDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  proficiency!: string | null;

  @ApiProperty()
  sortOrder!: number;
}

class ResumeProjectDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  role!: string | null;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ nullable: true })
  url!: string | null;

  @ApiPropertyOptional({ format: 'date', nullable: true })
  startDate!: string | null;

  @ApiPropertyOptional({ format: 'date', nullable: true })
  endDate!: string | null;

  @ApiProperty()
  sortOrder!: number;
}

class ResumeCertificateDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  issuer!: string | null;

  @ApiPropertyOptional({ format: 'date', nullable: true })
  issuedAt!: string | null;

  @ApiPropertyOptional({ format: 'date', nullable: true })
  expiresAt!: string | null;

  @ApiProperty({ nullable: true })
  credentialUrl!: string | null;

  @ApiProperty()
  sortOrder!: number;
}

export class ResumeDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  isPublished!: boolean;

  @ApiProperty({ format: 'date-time', nullable: true })
  unpublishAt!: Date | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  deletionScheduledAt?: Date | null;

  @ApiProperty({ nullable: true })
  publicSlug!: string | null;

  @ApiProperty()
  revision!: number;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty({ nullable: true })
  headline!: string | null;

  @ApiProperty({ nullable: true })
  email!: string | null;

  @ApiProperty({ nullable: true })
  phone!: string | null;

  @ApiProperty({ nullable: true })
  location!: string | null;

  @ApiProperty({ nullable: true })
  githubUrl!: string | null;

  @ApiProperty({ nullable: true })
  telegramHandle!: string | null;

  @ApiProperty({ nullable: true })
  websiteUrl!: string | null;

  @ApiProperty({ nullable: true })
  about!: string | null;

  @ApiProperty({ nullable: true })
  photoPath!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;

  @ApiProperty({ type: TemplateDto })
  template!: TemplateDto;

  @ApiProperty({ type: [ResumeSectionDto] })
  sections!: ResumeSectionDto[];

  @ApiProperty({ type: [ResumeExperienceDto] })
  experiences!: ResumeExperienceDto[];

  @ApiProperty({ type: [ResumeEducationDto] })
  educations!: ResumeEducationDto[];

  @ApiProperty({ type: [ResumeSkillDto] })
  skills!: ResumeSkillDto[];

  @ApiProperty({ type: [ResumeLanguageDto] })
  languages!: ResumeLanguageDto[];

  @ApiProperty({ type: [ResumeProjectDto] })
  projects!: ResumeProjectDto[];

  @ApiProperty({ type: [ResumeCertificateDto] })
  certificates!: ResumeCertificateDto[];
}
