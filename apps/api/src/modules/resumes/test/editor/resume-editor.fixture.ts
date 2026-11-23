import { randomUUID } from 'node:crypto';

import type { PrismaService } from '../../../../database/prisma.service';
import type { CreateResumeDto } from '../../dto/create-resume.dto';
import type { UpdateResumeDto } from '../../dto/update-resume.dto';

export async function createResumeEditorFixture(prisma: PrismaService) {
  const suffix = randomUUID();
  const applicant = { firstName: 'Анна', lastName: 'Петрова' };
  const templateSlug = `editor-simple-${suffix}`;
  const nextTemplateSlug = `editor-sidebar-${suffix}`;
  const { ownerId, templateIds } = await prisma.$transaction(async (db) => {
    const owner = await db.user.create({
      data: { ...applicant, email: `${suffix}@example.test`, passwordHash: 'unused' },
    });
    const template = await db.resumeTemplate.create({
      data: {
        slug: templateSlug,
        name: 'Одна колонка',
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
    const nextTemplate = await db.resumeTemplate.create({
      data: {
        slug: nextTemplateSlug,
        name: 'Боковая колонка',
        status: 'ACTIVE',
        layout: 'SIDEBAR_LEFT',
        pageWidthMm: 210,
        pageHeightMm: 297,
        sections: {
          create: [
            { type: 'ABOUT', region: 'MAIN', sortOrder: 0 },
            { type: 'SKILLS', region: 'SIDEBAR', sortOrder: 1 },
          ],
        },
      },
    });
    return { ownerId: owner.id, templateIds: [template.id, nextTemplate.id] };
  });
  const draft: CreateResumeDto = { ...applicant, templateSlug, title: 'Черновик резюме' };

  function editorInput(revision: number): UpdateResumeDto {
    return {
      ...applicant,
      revision,
      title: 'Резюме дизайнера',
      about: 'Проектирую интерфейсы.',
      sections: [
        { type: 'SKILLS', isVisible: false },
        { type: 'ABOUT', isVisible: true },
      ],
      experiences: [],
      educations: [],
      skills: [],
      languages: [],
      projects: [],
      certificates: [],
    };
  }

  return {
    ownerId,
    draft,
    editorInput,
    nextTemplateSlug,
    async cleanup() {
      await prisma.$transaction(async (db) => {
        await db.user.delete({ where: { id: ownerId } });
        await db.resumeTemplate.deleteMany({ where: { id: { in: templateIds } } });
      });
    },
  };
}
