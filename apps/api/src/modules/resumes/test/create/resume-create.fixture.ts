import { randomUUID } from 'node:crypto';

import type { INestApplication } from '@nestjs/common';

import { PrismaService } from '../../../../database/prisma.service';
import { AuthService } from '../../../auth/auth.service';
import type { CreateUserDto } from '../../../users/dto/create-user.dto';
import type { CreateResumeDto } from '../../dto/create-resume.dto';

export async function createResumeCreationFixture(app: INestApplication) {
  const prisma = app.get(PrismaService);
  const auth = app.get(AuthService);
  const suffix = randomUUID();
  const activeSlug = `create-active-${suffix}`;
  const draftSlug = `create-draft-${suffix}`;
  const user: CreateUserDto = {
    email: `${suffix}@example.test`,
    password: randomUUID(),
    firstName: 'Анна',
    lastName: 'Петрова',
  };

  async function cleanup() {
    await prisma.$transaction(async (db) => {
      await db.user.deleteMany({ where: { email: user.email } });
      await db.resumeTemplate.deleteMany({ where: { slug: { in: [activeSlug, draftSlug] } } });
    });
  }

  try {
    const { body: owner } = await auth.register(user);
    await prisma.resumeTemplate.create({
      data: {
        slug: activeSlug,
        name: 'Шаблон для создания',
        status: 'ACTIVE',
        layout: 'SINGLE_COLUMN',
        pageWidthMm: 210,
        pageHeightMm: 297,
        sections: {
          create: [
            { type: 'ABOUT', region: 'MAIN', sortOrder: 0 },
            { type: 'SKILLS', region: 'MAIN', sortOrder: 1 },
          ],
        },
      },
    });
    await prisma.resumeTemplate.create({
      data: {
        slug: draftSlug,
        name: 'Черновик шаблона',
        status: 'DRAFT',
        layout: 'SINGLE_COLUMN',
        pageWidthMm: 210,
        pageHeightMm: 297,
      },
    });

    const input: CreateResumeDto = {
      title: 'Резюме разработчика',
      firstName: 'Анна',
      lastName: 'Петрова',
      templateSlug: activeSlug,
      headline: 'Frontend-разработчик',
      about: 'Разрабатываю интерфейсы.',
    };
    const url = `${await app.getUrl()}/api/resumes`;

    return {
      prisma,
      owner,
      input,
      draftSlug,
      url,
      create(body: unknown, authenticated = true) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authenticated) {
          headers.Authorization = `Bearer ${owner.accessToken}`;
        }
        return fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
      },
      cleanup,
    };
  } catch (error) {
    await cleanup();
    throw error;
  }
}
