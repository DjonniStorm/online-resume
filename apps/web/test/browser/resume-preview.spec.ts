import { type Page, expect, test } from 'playwright/test';

import type { ResumeDto } from '../../src/shared/api/generated/types.gen';
import { editorResume, editorResumeId, session } from './fixtures/editor';

const currentResume: ResumeDto = {
  ...editorResume,
  title: 'Актуальная версия резюме',
  headline: 'Frontend-разработчик',
  revision: editorResume.revision + 1,
};

async function openPreview(page: Page, resume: ResumeDto | null = currentResume) {
  await page.addInitScript(() => {
    const testWindow = window as Window & { printCalls?: number };
    testWindow.printCalls = 0;
    window.print = () => {
      testWindow.printCalls = (testWindow.printCalls ?? 0) + 1;
    };
  });
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/auth/refresh') {
      await route.fulfill({ json: session });
      return;
    }
    if (path === '/api/resumes/deletions/notices') {
      await route.fulfill({ json: [] });
      return;
    }
    if (path === `/api/resumes/${editorResumeId}`) {
      await route.fulfill(
        resume ? { json: resume } : { status: 404, json: { message: 'Резюме не найдено' } },
      );
      return;
    }
    throw new Error(`Неожиданный запрос API: ${route.request().method()} ${path}`);
  });
  await page.goto(`/resumes/${editorResumeId}/preview`);
}

test.describe('Ожидаемое поведение предпросмотра и PDF', () => {
  test('показывает актуальные данные и создаёт PDF без элементов управления', async ({ page }) => {
    // Arrange
    await openPreview(page);
    await expect(page.getByRole('heading', { name: currentResume.title })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Анна Петрова' })).toBeVisible();
    await expect(page.getByText(currentResume.headline!)).toBeVisible();

    // Act
    await page.getByRole('button', { name: 'Сохранить как PDF' }).click();
    await page.emulateMedia({ media: 'print' });
    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });

    // Assert
    expect(await page.evaluate(() => (window as Window & { printCalls?: number }).printCalls)).toBe(
      1,
    );
    await expect(
      page.getByRole('button', { name: 'Сохранить как PDF', includeHidden: true }),
    ).toBeHidden();
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    expect(pdf.length).toBeGreaterThan(1000);
  });

  test('параметр print=1 открывает печать после загрузки резюме', async ({ page }) => {
    // Arrange
    await openPreview(page);

    // Act
    await page.goto(`/resumes/${editorResumeId}/preview?print=1`);

    // Assert
    await expect(page.getByRole('heading', { name: currentResume.title })).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => (window as Window & { printCalls?: number }).printCalls))
      .toBe(1);
  });
});

test.describe('Попытки открыть недоступное резюме', () => {
  test('показывает ошибку без кнопки PDF', async ({ page }) => {
    // Arrange
    await openPreview(page, null);

    // Act
    const unavailable = page.getByText('Резюме не найдено');

    // Assert
    await expect(unavailable).toBeVisible();
    await expect(page.getByRole('button', { name: 'Сохранить как PDF' })).toHaveCount(0);
    expect(await page.evaluate(() => (window as Window & { printCalls?: number }).printCalls)).toBe(
      0,
    );
  });
});
