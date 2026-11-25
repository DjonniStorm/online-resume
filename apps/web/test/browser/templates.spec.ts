import { expect, test } from 'playwright/test';

import { templates } from './fixtures/templates';

test.describe('Ожидаемое поведение страницы шаблонов', () => {
  test('показывает шаблоны, ищет по имени и открывает предпросмотр', async ({ page }) => {
    // Arrange
    const browserErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') {
        browserErrors.push(message.text());
      }
    });
    await page.route('**/api/**', async (route) => {
      const pathname = new URL(route.request().url()).pathname;
      if (pathname === '/api/templates') {
        const query = new URL(route.request().url()).searchParams.get('search')?.trim() ?? '';
        const items = templates.filter((template) =>
          template.name.toLowerCase().includes(query.toLowerCase()),
        );
        await route.fulfill({ json: { items, total: items.length, page: 1, limit: 3 } });
        return;
      }
      if (pathname === '/api/auth/refresh') {
        await route.fulfill({ status: 204 });
        return;
      }
      throw new Error(`Неожиданный запрос API: ${pathname}`);
    });
    await page.goto('/templates');
    const search = page.getByRole('textbox', { name: 'Поиск шаблонов' });
    await expect(page.getByRole('button', { name: 'Посмотреть шаблон Clear Focus' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Посмотреть шаблон Второй шаблон' }),
    ).toBeVisible();
    await search.fill('  Clear Focus  ');

    // Act
    const request = page.waitForRequest((item) => {
      const url = new URL(item.url());
      return url.pathname === '/api/templates' && url.searchParams.get('search') === 'Clear Focus';
    });
    await page.getByRole('button', { name: 'Найти' }).click();

    // Assert
    await request;
    await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe('Clear Focus');
    await expect(page.getByRole('button', { name: 'Посмотреть шаблон Второй шаблон' })).toHaveCount(
      0,
    );
    await page.reload();
    await expect(page.getByRole('textbox', { name: 'Поиск шаблонов' })).toHaveValue('Clear Focus');
    await expect(page.getByRole('button', { name: 'Посмотреть шаблон Второй шаблон' })).toHaveCount(
      0,
    );
    await page.getByRole('button', { name: 'Посмотреть шаблон Clear Focus' }).click();
    await expect(page.getByRole('dialog', { name: 'Clear Focus' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Создать резюме' })).toBeVisible();
    expect(browserErrors).toEqual([]);
  });
});
