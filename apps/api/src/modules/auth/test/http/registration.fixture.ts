import { randomUUID } from 'node:crypto';

import type { INestApplication } from '@nestjs/common';

import { PrismaService } from '../../../../database/prisma.service';
import type { CreateUserDto } from '../../../users/dto/create-user.dto';
import type { LoginDto } from '../../dto/login.dto';

export async function createRegistrationFixture(app: INestApplication) {
  const prisma = app.get(PrismaService);
  const baseUrl = `${await app.getUrl()}/api/auth`;
  const invalidEmail = `anna-${randomUUID()}`;
  const input: CreateUserDto = {
    email: `${invalidEmail}@example.test`,
    password: randomUUID(),
    firstName: 'Анна',
    lastName: 'Петрова',
  };
  const credentials: LoginDto = { email: input.email, password: input.password };

  function post(path: 'register' | 'login', payload: CreateUserDto | LoginDto): Promise<Response> {
    const request: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    };
    return fetch(`${baseUrl}/${path}`, request);
  }

  return {
    input,
    invalidEmail,
    register: (payload: CreateUserDto) => post('register', payload),
    login: () => post('login', credentials),
    findUser: (email: string) =>
      prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, firstName: true, lastName: true },
      }),
    async cleanup() {
      await prisma.user.deleteMany({ where: { email: { in: [input.email, invalidEmail] } } });
    },
  };
}
