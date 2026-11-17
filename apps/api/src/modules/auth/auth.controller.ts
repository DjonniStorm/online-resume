import { Body, Controller, Get, Headers, HttpCode, Patch, Post, Res } from '@nestjs/common';

import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import {
  CookieResponse,
  clearRefreshCookie,
  readRefreshCookie,
  setRefreshCookie,
} from './common/refresh-cookie';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
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
  async login(@Body() input: LoginDto, @Res({ passthrough: true }) response: CookieResponse) {
    const result = await this.auth.login(input);
    setRefreshCookie(response, result.refreshToken);
    return result.body;
  }

  @Post('refresh')
  @HttpCode(200)
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
  async logout(
    @Headers('cookie') cookieHeader: string | undefined,
    @Res({ passthrough: true }) response: CookieResponse,
  ) {
    const refreshToken = readRefreshCookie(cookieHeader);
    clearRefreshCookie(response);
    await this.auth.logout(refreshToken);
  }

  @Get('me')
  me(@Headers('authorization') authorization?: string) {
    return this.auth.me(authorization);
  }

  @Patch('me')
  updateProfile(
    @Headers('authorization') authorization: string | undefined,
    @Body() input: UpdateProfileDto,
  ) {
    return this.auth.updateProfile(authorization, input);
  }
}
