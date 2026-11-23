import { type Browser, type Page, expect, test } from 'playwright/test';

import type { ResumeDto } from '../../src/shared/api/generated/types.gen';
import { editorResume, editorResumeId, session } from './fixtures/editor';

const publicSlug = 'browser-public-resume';
const publicPath = `/r/${publicSlug}`;
const scheduledFor = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

async function openOwnerPreview(page: Page) {
  let resume: ResumeDto = structuredClone(editorResume);
  const actions: string[] = [];

  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    const method = route.request().method();
    if (path === '/api/auth/refresh') {
      await route.fulfill({ json: session });
      return;
    }
    if (path === '/api/resumes/deletions/notices') {
      await route.fulfill({ json: [] });
      return;
    }
    if (path === `/api/resumes/${editorResumeId}` && method === 'GET') {
      await route.fulfill({ json: resume });
      return;
    }
    if (path === `/api/resumes/${editorResumeId}/publish`) {
      actions.push(`${method} ${path}`);
      if (method === 'POST') {
        resume = { ...resume, isPublished: true, publicSlug };
        await route.fulfill({ json: { publicSlug } });
        return;
      }
      if (method === 'DELETE') {
        resume = { ...resume, isPublished: false, publicSlug: null, unpublishAt: null };
        await route.fulfill({ status: 204 });
        return;
      }
    }
    if (path === `/api/resumes/${editorResumeId}/unpublish-schedule`) {
      actions.push(`${method} ${path}`);
      if (method === 'POST') {
        resume = { ...resume, unpublishAt: scheduledFor };
        await route.fulfill({ json: { scheduledFor } });
        return;
      }
      if (method === 'DELETE') {
        resume = { ...resume, unpublishAt: null };
        await route.fulfill({ status: 204 });
        return;
      }
    }
    throw new Error(`Неожиданный запрос API: ${method} ${path}`);
  });

  await page.goto(`/resumes/${editorResumeId}/preview`);
  await expect(page.getByRole('heading', { name: resume.title })).toBeVisible();
  return {
    actions,
    get resume() {
      return resume;
    },
  };
}

async function openVisitor(browser: Browser, currentResume: () => ResumeDto) {
  const context = await browser.newContext();
  const visitor = await context.newPage();
  await visitor.addInitScript(() => {
    const testWindow = window as Window & { printCalls?: number };
    testWindow.printCalls = 0;
    window.print = () => {
      testWindow.printCalls = (testWindow.printCalls ?? 0) + 1;
    };
  });
  await visitor.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/auth/refresh') {
      await route.fulfill({ status: 204 });
      return;
    }
    if (path === `/api/public/resumes/${publicSlug}`) {
      const resume = currentResume();
      await route.fulfill(
        resume.isPublished
          ? { json: resume }
          : { status: 404, json: { message: 'Резюме недоступно' } },
      );
      return;
    }
    throw new Error(`Неожиданный запрос гостя: ${path}`);
  });
  return { context, visitor };
}

test.describe('Ожидаемое поведение публикации', () => {
  test('гость открывает опубликованную ссылку и сохраняет PDF', async ({ page, browser }) => {
    // Arrange
    const owner = await openOwnerPreview(page);
    await page.getByRole('button', { name: 'Опубликовать резюме' }).click();
    await expect(page.locator(`a[href$="${publicPath}"]`)).toBeVisible();
    const { context, visitor } = await openVisitor(browser, () => owner.resume);

    try {
      // Act
      await visitor.goto(publicPath);
      await expect(visitor.getByRole('heading', { name: 'Анна Петрова' })).toBeVisible();
      await visitor.getByRole('button', { name: 'Сохранить как PDF' }).first().click();
      const pdf = await visitor.pdf({ preferCSSPageSize: true, printBackground: true });

      // Assert
      expect(owner.actions).toContain(`POST /api/resumes/${editorResumeId}/publish`);
      expect(
        await visitor.evaluate(() => (window as Window & { printCalls?: number }).printCalls),
      ).toBe(1);
      expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
      expect(pdf.length).toBeGreaterThan(1000);
    } finally {
      await context.close();
    }
  });

  test('запланированное снятие оставляет ссылку доступной, отмена сохраняет её', async ({
    page,
    browser,
  }) => {
    // Arrange
    const owner = await openOwnerPreview(page);
    await page.getByRole('button', { name: 'Опубликовать резюме' }).click();
    const { context, visitor } = await openVisitor(browser, () => owner.resume);

    try {
      // Act
      await page.getByRole('button', { name: 'Действия с публикацией' }).click();
      await page.getByRole('menuitem', { name: 'Снять через 3 дня' }).click();

      // Assert
      await expect(page.getByText('Снятие запланировано')).toBeVisible();
      await visitor.goto(publicPath);
      await expect(visitor.getByRole('heading', { name: 'Анна Петрова' })).toBeVisible();
      await page.getByRole('button', { name: 'Действия с публикацией' }).click();
      await page.getByRole('menuitem', { name: 'Отменить снятие' }).click();
      await expect(page.getByText('Опубликовано')).toBeVisible();
      expect(owner.resume.unpublishAt).toBeNull();
      expect(owner.actions).toContain(`POST /api/resumes/${editorResumeId}/unpublish-schedule`);
      expect(owner.actions).toContain(`DELETE /api/resumes/${editorResumeId}/unpublish-schedule`);
    } finally {
      await context.close();
    }
  });
});

test.describe('Попытки открыть снятую публикацию', () => {
  test('немедленное снятие отключает внешнюю ссылку', async ({ page, browser }) => {
    // Arrange
    const owner = await openOwnerPreview(page);
    await page.getByRole('button', { name: 'Опубликовать резюме' }).click();
    const { context, visitor } = await openVisitor(browser, () => owner.resume);

    try {
      await visitor.goto(publicPath);
      await expect(visitor.getByRole('heading', { name: 'Анна Петрова' })).toBeVisible();

      // Act
      await page.getByRole('button', { name: 'Действия с публикацией' }).click();
      await page.getByRole('menuitem', { name: 'Снять сейчас' }).click();
      await visitor.reload();

      // Assert
      await expect(page.getByText('Не опубликовано')).toBeVisible();
      await expect(visitor.getByText('Резюме недоступно')).toBeVisible();
      await expect(visitor.getByRole('button', { name: 'Сохранить как PDF' })).toHaveCount(0);
      expect(owner.actions).toContain(`DELETE /api/resumes/${editorResumeId}/publish`);
    } finally {
      await context.close();
    }
  });
});
