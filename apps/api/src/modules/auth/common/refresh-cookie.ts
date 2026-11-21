import { UnauthorizedException } from '@nestjs/common';

import {
  MAX_REFRESH_TOKEN_LENGTH,
  REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_TTL_SECONDS,
} from './constants';

type CookieOptions = {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: string;
  maxAge?: number;
};

export interface CookieResponse {
  cookie(name: string, value: string, options: CookieOptions): void;
  clearCookie(name: string, options: CookieOptions): void;
}

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
  };
}

export function setRefreshCookie(response: CookieResponse, token: string): void {
  response.cookie(REFRESH_COOKIE_NAME, token, {
    ...cookieOptions(),
    maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
  });
}

export function clearRefreshCookie(response: CookieResponse): void {
  response.clearCookie(REFRESH_COOKIE_NAME, cookieOptions());
}

export function readRefreshCookie(header?: string): string {
  const prefix = `${REFRESH_COOKIE_NAME}=`;
  const token = header
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);

  if (!token || token.length > MAX_REFRESH_TOKEN_LENGTH) {
    throw new UnauthorizedException('Отсутствует refresh-токен');
  }
  return token;
}
