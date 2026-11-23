import { randomUUID } from 'node:crypto';

import type { PrismaService } from '../../../../database/prisma.service';

const applicant = { firstName: 'Анна', lastName: 'Петрова' };
const resumeTitles = ['Дизайнер стажёр', 'Верстальщик', 'Веб-дизайнер', 'Разработчик', 'Дизайнер'];

export async function createResumeListFixture(prisma: PrismaService) {
  const suffix = randomUUID();

  const { ownerId, otherOwnerId, templateId } = await prisma.$transaction(async (db) => {
    const createUser = (role: 'owner' | 'other') =>
      db.user.create({
        data: { ...applicant, email: `${role}-${suffix}@example.test`, passwordHash: 'unused' },
      });
    const owner = await createUser('owner');
    const otherOwner = await createUser('other');
    const template = await db.resumeTemplate.create({
      data: {
        slug: `test-${suffix}`,
        name: 'Тестовый шаблон',
        layout: 'SINGLE_COLUMN',
        pageWidthMm: 210,
        pageHeightMm: 297,
      },
    });
    const resume = { ...applicant, ownerId: owner.id, templateId: template.id };
    const oldestUpdate = Date.UTC(2026, 0, 1);
    const dayMs = 24 * 60 * 60 * 1000;

    await db.resume.createMany({
      data: [
        ...resumeTitles.map((title, index) => ({
          ...resume,
          title,
          updatedAt: new Date(oldestUpdate + index * dayMs),
        })),
        { ...resume, ownerId: otherOwner.id, title: 'Дизайнер другого пользователя' },
        { ...resume, title: 'Удалённый дизайнер', deletedAt: new Date() },
      ],
    });

    return { ownerId: owner.id, otherOwnerId: otherOwner.id, templateId: template.id };
  });

  return {
    ownerId,
    async cleanup() {
      await prisma.$transaction([
        prisma.user.deleteMany({ where: { id: { in: [ownerId, otherOwnerId] } } }),
        prisma.resumeTemplate.delete({ where: { id: templateId } }),
      ]);
    },
  };
}
