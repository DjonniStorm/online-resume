import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class UpdateProfileDto {
  @Transform(trim)
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsString()
  @Length(1, 100)
  firstName?: string;

  @Transform(trim)
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsString()
  @Length(1, 100)
  lastName?: string;

  @Transform(trim)
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @Matches(/^https:\/\/(?:www\.)?github\.com\/[^/?#]+(?:\/[^?#]*)?$/i)
  @MaxLength(2048)
  githubUrl?: string | null;

  @Transform(trim)
  @IsOptional()
  @Matches(/^@?[A-Za-z0-9_]{5,32}$/)
  telegramHandle?: string | null;

  @Transform(trim)
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(2048)
  websiteUrl?: string | null;
}
