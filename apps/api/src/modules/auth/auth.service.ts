import { createHash, randomUUID } from 'node:crypto';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { verifyPassword } from '../users/password';
import { UsersService } from '../users/service/users.service';
import { ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS } from './common/constants';
import { TokenPayload } from './common/types';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    config: ConfigService,
  ) {
    this.accessSecret = config.getOrThrow<string>('jwtAccessSecret');
    this.refreshSecret = config.getOrThrow<string>('jwtRefreshSecret');
    if (
      this.accessSecret.length < 32 ||
      this.refreshSecret.length < 32 ||
      this.accessSecret === this.refreshSecret
    ) {
      throw new Error(
        'JWT_ACCESS_SECRET и JWT_REFRESH_SECRET должны быть разными и не короче 32 символов',
      );
    }
  }

  async register(input: CreateUserDto) {
    const user = await this.users.create(input);
    return this.createSession(user);
  }

  async login(input: LoginDto) {
    const credentials = await this.users.findForLogin(input.email);
    if (!credentials || !(await verifyPassword(input.password, credentials.passwordHash))) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    return this.createSession(credentials.user);
  }

  async refresh(refreshToken: string) {
    const payload = await this.verifyToken(refreshToken, 'refresh');
    const now = new Date();
    const next = await this.signTokens(payload.sub, payload.sid);
    const updated = await this.prisma.authSession.updateMany({
      where: {
        id: payload.sid,
        userId: payload.sub,
        refreshTokenHash: hashToken(refreshToken),
        revokedAt: null,
        expiresAt: { gt: now },
      },
      data: {
        refreshTokenHash: hashToken(next.refreshToken),
        expiresAt: next.refreshExpiresAt,
      },
    });
    if (updated.count !== 1) {
      throw new UnauthorizedException('Недействительный refresh-токен');
    }

    const user = await this.users.findPublicById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Недействительный refresh-токен');
    }
    return { body: { ...next.response, user }, refreshToken: next.refreshToken };
  }

  async logout(refreshToken: string) {
    const payload = await this.verifyToken(refreshToken, 'refresh');
    const updated = await this.prisma.authSession.updateMany({
      where: {
        id: payload.sid,
        userId: payload.sub,
        refreshTokenHash: hashToken(refreshToken),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
    if (updated.count !== 1) {
      throw new UnauthorizedException('Недействительный refresh-токен');
    }
  }

  async me(authorization?: string) {
    const userId = await this.authenticate(authorization);
    const user = await this.users.findPublicById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async updateProfile(authorization: string | undefined, input: UpdateProfileDto) {
    const userId = await this.authenticate(authorization);
    return this.users.updateProfile(userId, input);
  }

  private async authenticate(authorization?: string): Promise<string> {
    const token = /^Bearer (\S+)$/i.exec(authorization ?? '')?.[1];
    if (!token) {
      throw new UnauthorizedException();
    }
    const payload = await this.verifyToken(token, 'access');
    const session = await this.prisma.authSession.findFirst({
      where: {
        id: payload.sid,
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { id: true },
    });
    if (!session) {
      throw new UnauthorizedException();
    }
    return payload.sub;
  }

  private async createSession(user: Awaited<ReturnType<UsersService['create']>>) {
    const sessionId = randomUUID();
    const next = await this.signTokens(user.id, sessionId);
    await this.prisma.authSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        refreshTokenHash: hashToken(next.refreshToken),
        expiresAt: next.refreshExpiresAt,
      },
    });
    return { body: { ...next.response, user }, refreshToken: next.refreshToken };
  }

  private async signTokens(userId: string, sessionId: string) {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, sid: sessionId, type: 'access' },
      { secret: this.accessSecret, algorithm: 'HS256', expiresIn: ACCESS_TOKEN_TTL_SECONDS },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, sid: sessionId, type: 'refresh', jti: randomUUID() },
      { secret: this.refreshSecret, algorithm: 'HS256', expiresIn: REFRESH_TOKEN_TTL_SECONDS },
    );
    return {
      refreshToken,
      refreshExpiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
      response: {
        accessToken,
        tokenType: 'Bearer',
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      },
    };
  }

  private async verifyToken(
    token: string,
    expectedType: TokenPayload['type'],
  ): Promise<TokenPayload> {
    try {
      const payload: unknown = await this.jwt.verifyAsync(token, {
        secret: expectedType === 'access' ? this.accessSecret : this.refreshSecret,
        algorithms: ['HS256'],
      });
      if (
        !payload ||
        typeof payload !== 'object' ||
        !('sub' in payload) ||
        typeof payload.sub !== 'string' ||
        !('sid' in payload) ||
        typeof payload.sid !== 'string' ||
        !('type' in payload) ||
        payload.type !== expectedType ||
        (expectedType === 'refresh' && (!('jti' in payload) || typeof payload.jti !== 'string'))
      ) {
        throw new Error('Invalid token payload');
      }
      return payload as TokenPayload;
    } catch {
      throw new UnauthorizedException('Недействительный токен');
    }
  }
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
