import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import { ResumeSectionType } from '../../../generated/prisma/enums';

const trim = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') {
    return value;
  }
  const result = value.trim();
  return result || undefined;
};

class UpdateResumeSectionDto {
  @ApiProperty({ enum: ResumeSectionType })
  @IsEnum(ResumeSectionType)
  type!: ResumeSectionType;

  @ApiProperty()
  @IsBoolean()
  isVisible!: boolean;
}

class UpdateResumeExperienceDto {
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @Length(1, 200)
  company!: string;

  @ApiProperty()
  @Transform(trim)
  @IsString()
  @Length(1, 200)
  position!: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty()
  @IsBoolean()
  isCurrent!: boolean;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;
}

class UpdateResumeEducationDto {
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @Length(1, 300)
  institution!: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  degree?: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  fieldOfStudy?: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;
}

class UpdateResumeSkillDto {
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @Length(1, 100)
  name!: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  level?: string;
}

class UpdateResumeLanguageDto {
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @Length(1, 100)
  name!: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  proficiency?: string;
}

class UpdateResumeProjectDto {
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @Length(1, 200)
  name!: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  role?: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/project' })
  @Transform(trim)
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(2048)
  url?: string;

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

class UpdateResumeCertificateDto {
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @Length(1, 200)
  name!: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  issuer?: string;

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString()
  issuedAt?: string;

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ example: 'https://example.com/certificate' })
  @Transform(trim)
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(2048)
  credentialUrl?: string;
}

export class UpdateResumeDto {
  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  revision!: number;

  @ApiProperty({ example: 'Резюме frontend-разработчика' })
  @Transform(trim)
  @IsString()
  @Length(1, 200)
  title!: string;

  @ApiProperty({ example: 'Анна' })
  @Transform(trim)
  @IsString()
  @Length(1, 100)
  firstName!: string;

  @ApiProperty({ example: 'Петрова' })
  @Transform(trim)
  @IsString()
  @Length(1, 100)
  lastName!: string;

  @ApiPropertyOptional({ example: 'Frontend-разработчик' })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  headline?: string;

  @ApiPropertyOptional({ example: 'anna@example.com' })
  @Transform(trim)
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @ApiPropertyOptional({ example: '+7 900 000-00-00' })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ example: 'Москва' })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ example: 'https://github.com/example' })
  @Transform(trim)
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @Matches(/^https:\/\/(?:www\.)?github\.com\/[^/?#]+(?:\/[^?#]*)?$/i)
  @MaxLength(2048)
  githubUrl?: string;

  @ApiPropertyOptional({ example: '@example' })
  @Transform(trim)
  @IsOptional()
  @Matches(/^@?[A-Za-z0-9_]{5,32}$/)
  telegramHandle?: string;

  @ApiPropertyOptional({ example: 'https://example.com' })
  @Transform(trim)
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(2048)
  websiteUrl?: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  about?: string;

  @ApiProperty({ type: [UpdateResumeSectionDto] })
  @IsArray()
  @ArrayMaxSize(9)
  @ValidateNested({ each: true })
  @Type(() => UpdateResumeSectionDto)
  sections!: UpdateResumeSectionDto[];

  @ApiProperty({ type: [UpdateResumeExperienceDto] })
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => UpdateResumeExperienceDto)
  experiences!: UpdateResumeExperienceDto[];

  @ApiProperty({ type: [UpdateResumeEducationDto] })
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => UpdateResumeEducationDto)
  educations!: UpdateResumeEducationDto[];

  @ApiProperty({ type: [UpdateResumeSkillDto] })
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => UpdateResumeSkillDto)
  skills!: UpdateResumeSkillDto[];

  @ApiProperty({ type: [UpdateResumeLanguageDto] })
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => UpdateResumeLanguageDto)
  languages!: UpdateResumeLanguageDto[];

  @ApiProperty({ type: [UpdateResumeProjectDto] })
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => UpdateResumeProjectDto)
  projects!: UpdateResumeProjectDto[];

  @ApiProperty({ type: [UpdateResumeCertificateDto] })
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => UpdateResumeCertificateDto)
  certificates!: UpdateResumeCertificateDto[];
}
