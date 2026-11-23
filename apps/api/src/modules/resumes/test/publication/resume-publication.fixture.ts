import { randomUUID } from 'node:crypto';

import type { PrismaService } from '../../../../database/prisma.service';
import type { CreateResumeDto } from '../../dto/create-resume.dto';

export async function createResumePublicationFixture(prisma: PrismaService) {
  const suffix = randomUUID();
  const templateSlug = `publication-${suffix}`;
  const applicant = { firstName: 'Анна', lastName: 'Петрова' };
  const { ownerId, templateId } = await prisma.$transaction(async (db) => {
    const owner = await db.user.create({
      data: { ...applicant, email: `${suffix}@example.test`, passwordHash: 'unused' },
    });
    const template = await db.resumeTemplate.create({
      data: {
        slug: templateSlug,
        name: 'Тестовый шаблон',
        status: 'ACTIVE',
        layout: 'SINGLE_COLUMN',
        pageWidthMm: 210,
        pageHeightMm: 297,
      },
    });
    return { ownerId: owner.id, templateId: template.id };
  });
  const input: CreateResumeDto = { ...applicant, templateSlug, title: 'Веб-дизайнер' };

  return {
    ownerId,
    input,
    async cleanup() {
      await prisma.$transaction(async (db) => {
        await db.user.delete({ where: { id: ownerId } });
        await db.resumeTemplate.delete({ where: { id: templateId } });
      });
    },
  };
}
