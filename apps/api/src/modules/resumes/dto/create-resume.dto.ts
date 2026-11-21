import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, IsUrl, Length, Matches, MaxLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateResumeDto {
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

  @ApiProperty({ example: 'left-rail' })
  @Transform(trim)
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(100)
  templateSlug!: string;

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

  @ApiPropertyOptional({ example: 'Разрабатываю интерфейсы и сервисы...' })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  about?: string;
}
