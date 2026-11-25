import { expect, test } from 'playwright/test';

import type { ResumeSummaryDto } from '../../src/shared/api/generated/types.gen';
import { editorResume, session } from './fixtures/editor';

const totalResumes = 12;
const resumes: ResumeSummaryDto[] = Array.from({ length: totalResumes }, (_, index) => ({
  id: `resume-${index + 1}`,
  title: `Резюме ${String(index + 1).padStart(2, '0')}`,
  firstName: 'Анна',
  lastName: 'Петрова',
  headline: null,
  isPublished: false,
  unpublishAt: null,
  deletionScheduledAt: null,
  viewsLast7Days: 0,
  template: {
    id: editorResume.template.id,
    slug: editorResume.template.slug,
    name: editorResume.template.name,
    layout: editorResume.template.layout,
    theme: null,
  },
  createdAt: editorResume.createdAt,
  updatedAt: editorResume.updatedAt,
}));

test.describe('Ожидаемое поведение списка резюме', () => {
  test('листит, ищет и открывает выбранное резюме', async ({ page }) => {
    // Arrange
    const listQueries: Array<{ page: number; limit: number; search: string }> = [];
    await page.route('**/api/**', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === '/api/auth/refresh') {
        await route.fulfill({ json: session });
        return;
      }
      if (url.pathname === '/api/resumes/deletions/notices') {
        await route.fulfill({ json: [] });
        return;
      }
      if (url.pathname === '/api/resumes') {
        const query = {
          page: Number(url.searchParams.get('page')),
          limit: Number(url.searchParams.get('limit')),
          search: url.searchParams.get('search') ?? '',
        };
        listQueries.push(query);
        const matches = resumes.filter((resume) =>
          resume.title.toLowerCase().includes(query.search.toLowerCase()),
        );
        const start = (query.page - 1) * query.limit;
        await route.fulfill({
          json: {
            items: matches.slice(start, start + query.limit),
            total: matches.length,
            page: query.page,
            limit: query.limit,
          },
        });
        return;
      }
      if (url.pathname === '/api/resumes/resume-12') {
        await route.fulfill({ json: { ...editorResume, id: 'resume-12', title: 'Резюме 12' } });
        return;
      }
      throw new Error(`Неожиданный запрос API: ${route.request().method()} ${url.pathname}`);
    });
    await page.goto('/resumes');
    await expect(page.getByRole('link', { name: 'Открыть резюме Резюме 01' })).toBeVisible();
    await expect(page.getByText('Показано 10 из 12')).toBeVisible();

    // Act
    await page.getByRole('button', { name: '2', exact: true }).click();
    await expect(page.getByRole('link', { name: 'Открыть резюме Резюме 12' })).toBeVisible();
    await expect(page.getByText('Показано 2 из 12')).toBeVisible();
    await expect(page).toHaveURL(/page=2/);
    await page.getByRole('textbox', { name: 'Поиск резюме' }).fill('  Резюме 12  ');
    await page.getByRole('button', { name: 'Найти' }).click();

    // Assert
    await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe('Резюме 12');
    await expect(page).not.toHaveURL(/page=/);
    await expect(page.getByText('Показано 1 из 1')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Открыть резюме Резюме 01' })).toHaveCount(0);
    expect(listQueries).toContainEqual({ page: 2, limit: 10, search: '' });
    expect(listQueries).toContainEqual({ page: 1, limit: 10, search: 'Резюме 12' });
    await page.reload();
    await expect(page.getByRole('textbox', { name: 'Поиск резюме' })).toHaveValue('Резюме 12');
    await expect(page.getByText('Показано 1 из 1')).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByRole('textbox', { name: 'Поиск резюме' })).toHaveValue('');
    await expect(page.getByText('Показано 2 из 12')).toBeVisible();
    await page.getByRole('combobox', { name: 'Резюме на странице' }).click();
    await page.getByRole('option', { name: '4', exact: true }).click();
    await expect(page).not.toHaveURL(/page=/);
    await expect(page.getByText('Показано 4 из 12')).toBeVisible();
    await page.reload();
    await expect(page.getByRole('combobox', { name: 'Резюме на странице' })).toHaveValue('4');
    await page.getByRole('button', { name: '3', exact: true }).click();
    await expect(page).toHaveURL(/page=3/);
    await expect(page.getByRole('link', { name: 'Открыть резюме Резюме 12' })).toBeVisible();
    await page.getByRole('link', { name: 'Открыть резюме Резюме 12' }).click();
    await expect(page).toHaveURL('/resumes/resume-12/edit');
    await expect(page.getByRole('textbox', { name: 'Название резюме' })).toHaveValue('Резюме 12');
  });
});

test.describe('Попытки сломать поиск резюме', () => {
  test('показывает пустой результат без чужих карточек', async ({ page }) => {
    // Arrange
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
      if (path === '/api/resumes') {
        await route.fulfill({ json: { items: [], total: 0, page: 1, limit: 10 } });
        return;
      }
      throw new Error(`Неожиданный запрос API: ${path}`);
    });
    await page.goto('/resumes');

    // Act
    await page.getByRole('textbox', { name: 'Поиск резюме' }).fill('Несуществующее');
    await page.getByRole('button', { name: 'Найти' }).click();

    // Assert
    await expect(page.getByText('Ничего не найдено')).toBeVisible();
    await expect(page.getByRole('link', { name: /^Открыть резюме / })).toHaveCount(0);
  });
});
