import type { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createHttpTestingApp } from '../../../../test/create-http-testing-app';
import type { CreateResumeDto } from '../../dto/create-resume.dto';
import type { ResumeDto } from '../../dto/resume-detail.dto';
import { createResumeCreationFixture } from './resume-create.fixture';

let app: INestApplication | undefined;
let fixture: Awaited<ReturnType<typeof createResumeCreationFixture>>;

beforeAll(async () => {
  app = await createHttpTestingApp();
});

beforeEach(async () => {
  if (!app) {
    throw new Error('Тестовый HTTP-сервер не запущен.');
  }
  fixture = await createResumeCreationFixture(app);
  return fixture.cleanup;
});

afterAll(async () => {
  await app?.close();
});

describe('Ожидаемое поведение создания резюме', () => {
  it('создаёт резюме с выбранным шаблоном и его разделами', async () => {
    // Arrange
    const input: CreateResumeDto = fixture.input;

    // Act
    const response = await fixture.create(input);
    const created = (await response.json()) as ResumeDto;
    const saved = await fixture.prisma.resume.findUnique({
      where: { id: created.id },
      include: { sections: { orderBy: { sortOrder: 'asc' } } },
    });

    // Assert
    expect(response.status).toBe(201);
    expect(created).toMatchObject({
      title: input.title,
      firstName: input.firstName,
      lastName: input.lastName,
      headline: input.headline,
      about: input.about,
      isPublished: false,
      template: { slug: input.templateSlug },
      sections: [
        { type: 'ABOUT', sortOrder: 0, isVisible: true },
        { type: 'SKILLS', sortOrder: 1, isVisible: true },
      ],
    });
    expect(saved?.ownerId).toBe(fixture.owner.user.id);
    expect(
      saved?.sections.map(({ type, sortOrder, isVisible }) => ({ type, sortOrder, isVisible })),
    ).toEqual([
      { type: 'ABOUT', sortOrder: 0, isVisible: true },
      { type: 'SKILLS', sortOrder: 1, isVisible: true },
    ]);
  });

  it('обрезает пробелы в полях перед сохранением', async () => {
    // Arrange
    const input: CreateResumeDto = {
      ...fixture.input,
      title: '  Резюме разработчика  ',
      firstName: '  Анна ',
      lastName: ' Петрова  ',
      headline: ' Frontend-разработчик ',
    };

    // Act
    const response = await fixture.create(input);
    const created = (await response.json()) as ResumeDto;

    // Assert
    expect(response.status).toBe(201);
    expect(created).toMatchObject({
      title: 'Резюме разработчика',
      firstName: 'Анна',
      lastName: 'Петрова',
      headline: 'Frontend-разработчик',
    });
  });
});

describe('Попытки сломать создание резюме', () => {
  it('отклоняет создание без токена', async () => {
    // Arrange
    const input: CreateResumeDto = fixture.input;

    // Act
    const response = await fixture.create(input, false);
    const count = await fixture.prisma.resume.count({ where: { ownerId: fixture.owner.user.id } });

    // Assert
    expect(response.status).toBe(401);
    expect(count).toBe(0);
  });

  it.each([
    ['отсутствующий', 'missing-template'],
    ['неактивный', 'draft'],
  ])('отклоняет %s шаблон', async (_description, slug) => {
    // Arrange
    const input: CreateResumeDto = {
      ...fixture.input,
      templateSlug: slug === 'draft' ? fixture.draftSlug : slug,
    };

    // Act
    const response = await fixture.create(input);
    const count = await fixture.prisma.resume.count({ where: { ownerId: fixture.owner.user.id } });

    // Assert
    expect(response.status).toBe(404);
    expect(count).toBe(0);
  });

  it.each([
    ['пустое название', { title: '   ' }],
    ['неверный slug', { templateSlug: 'Wrong Slug' }],
    ['слишком длинное имя', { firstName: 'А'.repeat(101) }],
  ])('отклоняет %s', async (_description, changes) => {
    // Arrange
    const input: CreateResumeDto = { ...fixture.input, ...changes };

    // Act
    const response = await fixture.create(input);
    const count = await fixture.prisma.resume.count({ where: { ownerId: fixture.owner.user.id } });

    // Assert
    expect(response.status).toBe(400);
    expect(count).toBe(0);
  });
});
