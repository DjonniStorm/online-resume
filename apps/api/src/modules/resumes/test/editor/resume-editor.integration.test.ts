import { BadRequestException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { PrismaService } from '../../../../database/prisma.service';
import type { ChangeResumeTemplateDto } from '../../dto/change-resume-template.dto';
import type { UpdateResumeDto } from '../../dto/update-resume.dto';
import { ResumesService } from '../../resumes.service';
import { createResumeTestingModule } from '../create-resume-testing-module';
import { createResumeEditorFixture } from './resume-editor.fixture';

let moduleRef: TestingModule | undefined;
let fixture: Awaited<ReturnType<typeof createResumeEditorFixture>>;
let prisma: PrismaService;
let resumes: ResumesService;

beforeAll(async () => {
  moduleRef = await createResumeTestingModule();
  prisma = moduleRef.get(PrismaService);
  resumes = moduleRef.get(ResumesService);
});

beforeEach(async () => {
  fixture = await createResumeEditorFixture(prisma);
  return fixture.cleanup;
});

afterAll(async () => {
  await moduleRef?.close();
});

describe('Ожидаемое поведение', () => {
  it('сохраняет текст, порядок и видимость разделов', async () => {
    // Arrange
    const { ownerId, draft, editorInput } = fixture;
    const resume = await resumes.create(ownerId, draft);
    const input: UpdateResumeDto = editorInput(resume.revision);

    // Act
    await resumes.update(ownerId, resume.id, input);
    const saved = await resumes.findOne(ownerId, resume.id);

    // Assert
    expect(saved).toMatchObject({
      title: input.title,
      about: input.about,
      sections: input.sections,
    });
  });

  it('сохраняет данные при смене шаблона', async () => {
    // Arrange
    const { ownerId, draft, editorInput, nextTemplateSlug } = fixture;
    const resume = await resumes.create(ownerId, draft);
    const edited = await resumes.update(ownerId, resume.id, editorInput(resume.revision));
    const input: ChangeResumeTemplateDto = {
      revision: edited.revision,
      templateSlug: nextTemplateSlug,
    };

    // Act
    await resumes.changeTemplate(ownerId, resume.id, input);
    const saved = await resumes.findOne(ownerId, resume.id);

    // Assert
    expect(saved).toMatchObject({
      template: { slug: nextTemplateSlug, layout: 'SIDEBAR_LEFT' },
      title: edited.title,
      about: edited.about,
      sections: edited.sections.map(({ type, isVisible }) => ({ type, isVisible })),
    });
  });
});

describe('Попытки сломать сохранение', () => {
  it('отклоняет дубли разделов без потери данных', async () => {
    // Arrange
    const { ownerId, draft, editorInput } = fixture;
    const resume = await resumes.create(ownerId, draft);
    const input: UpdateResumeDto = {
      ...editorInput(resume.revision),
      sections: [
        { type: 'ABOUT', isVisible: true },
        { type: 'ABOUT', isVisible: false },
      ],
    };

    // Act
    const update = resumes.update(ownerId, resume.id, input);

    // Assert
    await expect(update).rejects.toBeInstanceOf(BadRequestException);
    expect(await resumes.findOne(ownerId, resume.id)).toMatchObject({
      revision: resume.revision,
      title: resume.title,
      sections: resume.sections,
    });
  });
});
