import { randomUUID } from 'node:crypto';

import type { INestApplication } from '@nestjs/common';

import { PrismaService } from '../../../../database/prisma.service';
import { AuthService } from '../../../auth/auth.service';
import type { CreateUserDto } from '../../../users/dto/create-user.dto';
import type { CreateResumeDto } from '../../dto/create-resume.dto';
import { ResumesService } from '../../resumes.service';

export async function createResumeViewsFixture(app: INestApplication) {
  const prisma = app.get(PrismaService);
  const auth = app.get(AuthService);
  const resumes = app.get(ResumesService);
  const suffix = randomUUID();
  const templateSlug = `views-${suffix}`;
  const user: CreateUserDto = {
    email: `${suffix}@example.test`,
    password: randomUUID(),
    firstName: 'Анна',
    lastName: 'Петрова',
  };

  async function cleanup() {
    await prisma.$transaction(async (db) => {
      await db.user.deleteMany({ where: { email: user.email } });
      await db.resumeTemplate.deleteMany({ where: { slug: templateSlug } });
    });
  }

  try {
    const { body: owner } = await auth.register(user);
    await prisma.resumeTemplate.create({
      data: {
        slug: templateSlug,
        name: 'Шаблон для просмотров',
        status: 'ACTIVE',
        layout: 'SINGLE_COLUMN',
        pageWidthMm: 210,
        pageHeightMm: 297,
      },
    });
    const input: CreateResumeDto = {
      title: 'Первое резюме',
      firstName: user.firstName,
      lastName: user.lastName,
      templateSlug,
    };
    const first = await resumes.create(owner.user.id, input);
    const second = await resumes.create(owner.user.id, { ...input, title: 'Второе резюме' });
    const firstLink = await resumes.publish(owner.user.id, first.id);
    const secondLink = await resumes.publish(owner.user.id, second.id);
    const baseUrl = await app.getUrl();
    const headers: RequestInit['headers'] = { Authorization: `Bearer ${owner.accessToken}` };

    return {
      prisma,
      owner,
      first,
      second,
      firstLink,
      secondLink,
      publicGet(slug: string, cookie?: string) {
        return fetch(`${baseUrl}/api/public/resumes/${slug}`, {
          headers: cookie ? { Cookie: cookie } : undefined,
        });
      },
      overview(resumeId?: string) {
        const query = resumeId ? `?resumeId=${encodeURIComponent(resumeId)}` : '';
        return fetch(`${baseUrl}/api/resumes/overview${query}`, { headers });
      },
      list() {
        return fetch(`${baseUrl}/api/resumes?page=1&limit=10`, { headers });
      },
      cleanup,
    };
  } catch (error) {
    await cleanup();
    throw error;
  }
}
