import { randomUUID } from 'node:crypto';

import type { INestApplication } from '@nestjs/common';

import { PrismaService } from '../../../../database/prisma.service';
import type { CreateResumeDto } from '../../../resumes/dto/create-resume.dto';
import { ResumesService } from '../../../resumes/resumes.service';
import type { CreateUserDto } from '../../../users/dto/create-user.dto';
import { AuthService } from '../../auth.service';

export async function createResumeAccessFixture(app: INestApplication) {
  const prisma = app.get(PrismaService);
  const auth = app.get(AuthService);
  const resumes = app.get(ResumesService);
  const id = randomUUID();
  const templateSlug = `access-${id}`;
  const ownerInput: CreateUserDto = {
    email: `owner-${id}@example.test`,
    password: randomUUID(),
    firstName: 'Анна',
    lastName: 'Петрова',
  };
  const otherUserInput: CreateUserDto = {
    email: `other-${id}@example.test`,
    password: randomUUID(),
    firstName: 'Иван',
    lastName: 'Соколов',
  };

  async function cleanup() {
    await prisma.$transaction(async (db) => {
      await db.user.deleteMany({
        where: { email: { in: [ownerInput.email, otherUserInput.email] } },
      });
      await db.resumeTemplate.deleteMany({ where: { slug: templateSlug } });
    });
  }

  try {
    const { body: owner } = await auth.register(ownerInput);
    const { body: otherUser } = await auth.register(otherUserInput);
    await prisma.resumeTemplate.create({
      data: {
        slug: templateSlug,
        name: 'Шаблон для проверки доступа',
        status: 'ACTIVE',
        layout: 'SINGLE_COLUMN',
        pageWidthMm: 210,
        pageHeightMm: 297,
      },
    });
    const input: CreateResumeDto = {
      firstName: ownerInput.firstName,
      lastName: ownerInput.lastName,
      title: 'Резюме дизайнера',
      templateSlug,
    };
    const resume = await resumes.create(owner.user.id, input);
    const baseUrl = await app.getUrl();

    return { url: `${baseUrl}/api/resumes/${resume.id}`, owner, otherUser, resume, cleanup };
  } catch (error) {
    await cleanup();
    throw error;
  }
}
