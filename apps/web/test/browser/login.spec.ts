import { type Page, expect, test } from 'playwright/test';

import type { LoginDto, ResumeOverviewDto } from '../../src/shared/api/generated/types.gen';
import { session } from './fixtures/editor';

const credentials: LoginDto = {
  email: 'anna@example.test',
  password: 'ValidPassword123',
};

const emptyOverview: ResumeOverviewDto = {
  total: 0,
  publishedCount: 0,
  viewsTotal: 0,
  viewsLast7Days: 0,
  dailyViews: [],
  selectedResume: null,
  latestResume: null,
  scheduledLinks: [],
};

async function openLogin(page: Page) {
  const requests: LoginDto[] = [];
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/auth/refresh') {
      await route.fulfill({ status: 204 });
      return;
    }
    if (path === '/api/auth/login') {
      const input = route.request().postDataJSON() as LoginDto;
      requests.push(input);
      await route.fulfill(
        input.email === credentials.email && input.password === credentials.password
          ? { json: session }
          : { status: 401, json: { message: 'Неверные учётные данные' } },
      );
      return;
    }
    if (path === '/api/resumes/deletions/notices') {
      await route.fulfill({ json: [] });
      return;
    }
    if (path === '/api/resumes/overview') {
      await route.fulfill({ json: emptyOverview });
      return;
    }
    if (path === '/api/resumes') {
      await route.fulfill({ json: { items: [], total: 0, page: 1, limit: 10 } });
      return;
    }
    throw new Error(`Неожиданный запрос API: ${route.request().method()} ${path}`);
  });
  await page.goto('/auth/login');
  await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();
  return requests;
}

test.describe('Ожидаемое поведение входа', () => {
  test('нормализует email и открывает личную главную', async ({ page }) => {
    // Arrange
    const requests = await openLogin(page);
    await page
      .getByRole('textbox', { name: 'Email' })
      .fill(`  ${credentials.email.toUpperCase()}  `);
    await page.getByLabel('Пароль').fill(credentials.password);

    // Act
    await page.getByRole('button', { name: 'Войти' }).click();

    // Assert
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('link', { name: 'Мои резюме' })).toBeVisible();
    expect(requests).toEqual([credentials]);
  });
});

test.describe('Попытки сломать вход', () => {
  test('не отправляет пустые или неверно заполненные поля', async ({ page }) => {
    // Arrange
    const requests = await openLogin(page);

    // Act
    await page.getByRole('button', { name: 'Войти' }).click();

    // Assert
    await expect(page.getByText('Введите email')).toBeVisible();
    await expect(page.getByText('Введите пароль')).toBeVisible();
    expect(requests).toHaveLength(0);

    await page.getByRole('textbox', { name: 'Email' }).fill('anna@');
    await page.getByLabel('Пароль').fill('short');
    await page.getByRole('button', { name: 'Войти' }).click();
    await expect(page.getByText('Введите корректный email')).toBeVisible();
    await expect(page.getByText('Пароль должен содержать от 8 до 128 символов')).toBeVisible();
    expect(requests).toHaveLength(0);
  });

  test('показывает неверный пароль и позволяет повторить вход', async ({ page }) => {
    // Arrange
    const requests = await openLogin(page);
    await page.getByRole('textbox', { name: 'Email' }).fill(credentials.email);
    await page.getByLabel('Пароль').fill('WrongPassword123');

    // Act
    await page.getByRole('button', { name: 'Войти' }).click();

    // Assert
    await expect(page.getByRole('alert')).toContainText('Неверный email или пароль');
    await expect(page).toHaveURL('/auth/login');
    await page.getByLabel('Пароль').fill(credentials.password);
    await page.getByRole('button', { name: 'Войти' }).click();
    await expect(page).toHaveURL('/');
    expect(requests).toEqual([{ ...credentials, password: 'WrongPassword123' }, credentials]);
  });
});
