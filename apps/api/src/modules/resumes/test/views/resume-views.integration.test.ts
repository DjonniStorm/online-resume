import { randomUUID } from 'node:crypto';

import type { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createHttpTestingApp } from '../../../../test/create-http-testing-app';
import type { ResumeOverviewDto } from '../../dto/resume-overview.dto';
import type { ResumeListDto } from '../../dto/resume-summary.dto';
import { createResumeViewsFixture } from './resume-views.fixture';

let app: INestApplication | undefined;
let fixture: Awaited<ReturnType<typeof createResumeViewsFixture>>;

beforeAll(async () => {
  app = await createHttpTestingApp();
});

beforeEach(async () => {
  if (!app) {
    throw new Error('Тестовый HTTP-сервер не запущен.');
  }
  fixture = await createResumeViewsFixture(app);
  return fixture.cleanup;
});

afterAll(async () => {
  await app?.close();
});

describe('Ожидаемое поведение просмотров', () => {
  it('считает одного посетителя раз в 24 часа для каждого резюме', async () => {
    // Arrange
    const firstVisit = await fixture.publicGet(fixture.firstLink.publicSlug);
    const cookie = firstVisit.headers.get('set-cookie')?.split(';')[0];
    expect(cookie).toMatch(/^resume_visitor=/);

    // Act
    const repeatedVisit = await fixture.publicGet(fixture.firstLink.publicSlug, cookie);
    const secondResumeVisit = await fixture.publicGet(fixture.secondLink.publicSlug, cookie);
    const differentVisitor = await fixture.publicGet(fixture.firstLink.publicSlug);
    const views = await fixture.prisma.resumeView.findMany({
      where: { resumeId: { in: [fixture.first.id, fixture.second.id] } },
    });

    // Assert
    expect([
      firstVisit.status,
      repeatedVisit.status,
      secondResumeVisit.status,
      differentVisitor.status,
    ]).toEqual([200, 200, 200, 200]);
    expect(views).toHaveLength(3);
    expect(views.map(({ resumeId }) => resumeId).sort()).toEqual(
      [fixture.first.id, fixture.first.id, fixture.second.id].sort(),
    );
  });

  it('разрешает повторный просмотр после истечения 24 часов', async () => {
    // Arrange
    const firstVisit = await fixture.publicGet(fixture.firstLink.publicSlug);
    const cookie = firstVisit.headers.get('set-cookie')?.split(';')[0];
    await fixture.prisma.resumeView.updateMany({
      where: { resumeId: fixture.first.id },
      data: { viewedAt: new Date(Date.now() - 25 * 60 * 60 * 1000) },
    });

    // Act
    const repeatedVisit = await fixture.publicGet(fixture.firstLink.publicSlug, cookie);
    const count = await fixture.prisma.resumeView.count({ where: { resumeId: fixture.first.id } });

    // Assert
    expect(repeatedVisit.status).toBe(200);
    expect(count).toBe(2);
  });

  it('отдаёт просмотры выбранного резюме отдельно от общей статистики', async () => {
    // Arrange
    await fixture.publicGet(fixture.firstLink.publicSlug);
    await fixture.publicGet(fixture.secondLink.publicSlug);
    await fixture.prisma.resumeView.create({
      data: {
        resumeId: fixture.first.id,
        visitorKey: randomUUID(),
        viewedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
    });

    // Act
    const all = (await (await fixture.overview()).json()) as ResumeOverviewDto;
    const selected = (await (await fixture.overview(fixture.first.id)).json()) as ResumeOverviewDto;
    const list = (await (await fixture.list()).json()) as ResumeListDto;

    // Assert
    expect(all).toMatchObject({ viewsTotal: 3, viewsLast7Days: 2, selectedResume: null });
    expect(selected).toMatchObject({
      viewsTotal: 2,
      viewsLast7Days: 1,
      selectedResume: { id: fixture.first.id },
    });
    expect(selected.dailyViews.reduce((sum, day) => sum + day.count, 0)).toBe(1);
    expect(list.items.find(({ id }) => id === fixture.first.id)?.viewsLast7Days).toBe(1);
    expect(list.items.find(({ id }) => id === fixture.second.id)?.viewsLast7Days).toBe(1);
  });
});

describe('Попытки сломать статистику', () => {
  it('не записывает просмотр недоступной ссылки', async () => {
    // Arrange
    await fixture.prisma.resume.update({
      where: { id: fixture.first.id },
      data: { isPublished: false },
    });

    // Act
    const response = await fixture.publicGet(fixture.firstLink.publicSlug);
    const count = await fixture.prisma.resumeView.count({ where: { resumeId: fixture.first.id } });

    // Assert
    expect(response.status).toBe(404);
    expect(response.headers.get('set-cookie')).toBeNull();
    expect(count).toBe(0);
  });
});
