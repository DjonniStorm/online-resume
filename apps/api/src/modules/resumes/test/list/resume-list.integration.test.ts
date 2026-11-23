import type { TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { PrismaService } from '../../../../database/prisma.service';
import type { ResumeListQueryDto } from '../../dto/resume-list-query.dto';
import { ResumesService } from '../../resumes.service';
import { createResumeTestingModule } from '../create-resume-testing-module';
import { createResumeListFixture } from './resume-list.fixture';

let moduleRef: TestingModule | undefined;
let fixture: Awaited<ReturnType<typeof createResumeListFixture>> | undefined;
let resumes: ResumesService;
let ownerId: string;

beforeAll(async () => {
  moduleRef = await createResumeTestingModule();

  fixture = await createResumeListFixture(moduleRef.get(PrismaService));
  ownerId = fixture.ownerId;
  resumes = moduleRef.get(ResumesService);
});

afterAll(async () => {
  try {
    await fixture?.cleanup();
  } finally {
    await moduleRef?.close();
  }
});

const twoPerPage = 2;
const firstPage = 1;
const pageBeyondList = 4;

describe('Ожидаемое поведение', () => {
  it('показывает новые резюме первыми без повторов', async () => {
    // Arrange
    const queries = [1, 2, 3].map((page): ResumeListQueryDto => ({ page, limit: twoPerPage }));

    // Act
    const pages = await Promise.all(queries.map((query) => resumes.findAll(ownerId, query)));

    // Assert
    expect(
      pages.map(({ page, total, items }) => ({
        page,
        total,
        titles: items.map(({ title }) => title),
      })),
    ).toEqual([
      { page: 1, total: 5, titles: ['Дизайнер', 'Разработчик'] },
      { page: 2, total: 5, titles: ['Веб-дизайнер', 'Верстальщик'] },
      { page: 3, total: 5, titles: ['Дизайнер стажёр'] },
    ]);
  });

  it('ищет до разбиения на страницы', async () => {
    // Arrange
    const secondPage = 2;
    const query: ResumeListQueryDto = { page: secondPage, limit: twoPerPage, search: '  ДИЗАЙН  ' };

    // Act
    const result = await resumes.findAll(ownerId, query);

    // Assert
    expect(result).toMatchObject({
      page: secondPage,
      total: 3,
      items: [{ title: 'Дизайнер стажёр' }],
    });
  });
});

describe('Попытки сломать пагинацию', () => {
  it('не находит чужие и удалённые резюме', async () => {
    // Arrange
    const limitForAllMatches = 5;
    const query: ResumeListQueryDto = {
      page: firstPage,
      limit: limitForAllMatches,
      search: 'дизайн',
    };

    // Act
    const result = await resumes.findAll(ownerId, query);

    // Assert
    expect(result.total).toBe(3);
    expect(result.items.map(({ title }) => title)).toEqual([
      'Дизайнер',
      'Веб-дизайнер',
      'Дизайнер стажёр',
    ]);
  });

  it('возвращает последнюю страницу при выходе за пределы', async () => {
    // Arrange
    const query: ResumeListQueryDto = { page: pageBeyondList, limit: twoPerPage };

    // Act
    const result = await resumes.findAll(ownerId, query);

    // Assert
    expect(result).toMatchObject({ page: 3, items: [{ title: 'Дизайнер стажёр' }] });
  });

  it('возвращает пустую первую страницу без совпадений', async () => {
    // Arrange
    const query: ResumeListQueryDto = {
      page: pageBeyondList,
      limit: twoPerPage,
      search: 'бухгалтер',
    };

    // Act
    const result = await resumes.findAll(ownerId, query);

    // Assert
    expect(result).toEqual({ page: firstPage, limit: twoPerPage, total: 0, items: [] });
  });
});
