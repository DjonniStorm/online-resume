import { ApiProperty } from '@nestjs/swagger';

import { PublicUserDto } from './public-user.dto';

export class AuthResultDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ enum: ['Bearer'] })
  tokenType!: 'Bearer';

  @ApiProperty({ description: 'Срок действия access-токена в секундах.' })
  expiresIn!: number;

  @ApiProperty({ type: PublicUserDto })
  user!: PublicUserDto;
}
