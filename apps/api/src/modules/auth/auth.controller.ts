import { Body, Controller, Get, Headers, HttpCode, Patch, Post, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import {
  CookieResponse,
  clearRefreshCookie,
  readRefreshCookie,
  setRefreshCookie,
} from './common/refresh-cookie';
import { AuthResultDto } from './dto/auth-result.dto';
import { LoginDto } from './dto/login.dto';
import { PublicUserDto } from './dto/public-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @ApiOperation({ operationId: 'authRegister' })
  @ApiCreatedResponse({ type: AuthResultDto })
  @ApiBadRequestResponse({ description: 'Поля не прошли проверку.' })
  @ApiConflictResponse({ description: 'Email уже используется.' })
  async register(
    @Body() input: CreateUserDto,
    @Res({ passthrough: true }) response: CookieResponse,
  ) {
    const result = await this.auth.register(input);
    setRefreshCookie(response, result.refreshToken);
    return result.body;
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ operationId: 'authLogin' })
  @ApiOkResponse({ type: AuthResultDto })
  @ApiBadRequestResponse({ description: 'Поля не прошли проверку.' })
  @ApiUnauthorizedResponse({ description: 'Неверный email или пароль.' })
  async login(@Body() input: LoginDto, @Res({ passthrough: true }) response: CookieResponse) {
    const result = await this.auth.login(input);
    setRefreshCookie(response, result.refreshToken);
    return result.body;
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ operationId: 'authRefresh' })
  @ApiCookieAuth('resume_refresh')
  @ApiOkResponse({ type: AuthResultDto })
  @ApiUnauthorizedResponse({ description: 'Refresh-токен отсутствует или недействителен.' })
  async refresh(
    @Headers('cookie') cookieHeader: string | undefined,
    @Res({ passthrough: true }) response: CookieResponse,
  ) {
    const result = await this.auth.refresh(readRefreshCookie(cookieHeader));
    setRefreshCookie(response, result.refreshToken);
    return result.body;
  }

  @Post('logout')
  @HttpCode(204)
  @ApiOperation({ operationId: 'authLogout' })
  @ApiCookieAuth('resume_refresh')
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ description: 'Refresh-токен отсутствует или недействителен.' })
  async logout(
    @Headers('cookie') cookieHeader: string | undefined,
    @Res({ passthrough: true }) response: CookieResponse,
  ) {
    const refreshToken = readRefreshCookie(cookieHeader);
    clearRefreshCookie(response);
    await this.auth.logout(refreshToken);
  }

  @Get('me')
  @ApiOperation({ operationId: 'authMe' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: PublicUserDto })
  @ApiUnauthorizedResponse()
  me(@Headers('authorization') authorization?: string) {
    return this.auth.me(authorization);
  }

  @Patch('me')
  @ApiOperation({ operationId: 'authUpdateProfile' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: PublicUserDto })
  @ApiBadRequestResponse({ description: 'Поля не прошли проверку.' })
  @ApiUnauthorizedResponse()
  updateProfile(
    @Headers('authorization') authorization: string | undefined,
    @Body() input: UpdateProfileDto,
  ) {
    return this.auth.updateProfile(authorization, input);
  }
}
