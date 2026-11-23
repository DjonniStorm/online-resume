import { randomUUID } from 'node:crypto';

import type { INestApplication } from '@nestjs/common';

import { PrismaService } from '../../../../database/prisma.service';
import { AuthService } from '../../../auth/auth.service';
import type { CreateUserDto } from '../../../users/dto/create-user.dto';
import type { CreateResumeDto } from '../../dto/create-resume.dto';
import { ResumesService } from '../../resumes.service';

// PNG размером 1×1 пиксель. Для загрузки отправляем полный файл.
export const photoPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=',
  'base64',
);

export async function createResumePhotoFixture(app: INestApplication) {
  const prisma = app.get(PrismaService);
  const auth = app.get(AuthService);
  const resumes = app.get(ResumesService);
  const suffix = randomUUID();
  const templateSlug = `photo-${suffix}`;
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
        name: 'Шаблон для проверки фото',
        status: 'ACTIVE',
        layout: 'SINGLE_COLUMN',
        pageWidthMm: 210,
        pageHeightMm: 297,
      },
    });
    const input: CreateResumeDto = {
      firstName: user.firstName,
      lastName: user.lastName,
      title: 'Резюме дизайнера',
      templateSlug,
    };
    const resume = await resumes.create(owner.user.id, input);
    const url = `${await app.getUrl()}/api/resumes/${resume.id}/photo`;
    const headers: RequestInit['headers'] = { Authorization: `Bearer ${owner.accessToken}` };

    return {
      upload(file: File) {
        const body = new FormData();
        body.set('file', file);
        const request: RequestInit = { method: 'POST', headers, body };
        return fetch(url, request);
      },
      read: () => fetch(url, { headers }),
      remove: () => fetch(url, { method: 'DELETE', headers }),
      cleanup,
    };
  } catch (error) {
    await cleanup();
    throw error;
  }
}
