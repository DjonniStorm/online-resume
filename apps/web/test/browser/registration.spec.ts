import { type Page, expect, test } from 'playwright/test';

import type { CreateUserDto, ResumeOverviewDto } from '../../src/shared/api/generated/types.gen';
import { session } from './fixtures/editor';

const registration: CreateUserDto = {
  firstName: 'Анна',
  lastName: 'Петрова',
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

async function openRegistration(page: Page, registerStatus = 201) {
  const requests: CreateUserDto[] = [];
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/auth/refresh') {
      await route.fulfill({ status: 204 });
      return;
    }
    if (path === '/api/auth/register') {
      const input = route.request().postDataJSON() as CreateUserDto;
      requests.push(input);
      const status = input.email === registration.email ? registerStatus : 201;
      await route.fulfill(
        status === 201
          ? { status: 201, json: session }
          : { status, json: { message: 'Email уже используется' } },
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
  await page.goto('/auth/register');
  await expect(page.getByRole('heading', { name: 'Создать аккаунт' })).toBeVisible();
  return requests;
}

async function fillRegistration(page: Page, values = registration) {
  await page.getByRole('textbox', { name: 'Имя', exact: true }).fill(values.firstName);
  await page.getByRole('textbox', { name: 'Фамилия' }).fill(values.lastName);
  await page.getByRole('textbox', { name: 'Email' }).fill(values.email);
  await page.getByLabel('Пароль', { exact: true }).fill(values.password);
  await page.getByLabel('Повторите пароль').fill(values.password);
}

test.describe('Ожидаемое поведение регистрации', () => {
  test('нормализует данные, создаёт сессию и открывает личную главную', async ({ page }) => {
    // Arrange
    const requests = await openRegistration(page);
    await fillRegistration(page, {
      ...registration,
      firstName: `  ${registration.firstName}  `,
      email: `  ${registration.email.toUpperCase()}  `,
    });

    // Act
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();

    // Assert
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('link', { name: 'Мои резюме' })).toBeVisible();
    expect(requests).toEqual([registration]);
  });
});

test.describe('Попытки сломать регистрацию', () => {
  test('не отправляет пустые обязательные поля', async ({ page }) => {
    // Arrange
    const requests = await openRegistration(page);

    // Act
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();

    // Assert
    await expect(page.getByText('Заполните поле')).toHaveCount(2);
    await expect(page.getByText('Введите email')).toBeVisible();
    await expect(page.getByText('Введите пароль')).toBeVisible();
    expect(requests).toHaveLength(0);
  });

  test('отклоняет слишком длинное имя и короткий пароль до запроса', async ({ page }) => {
    // Arrange
    const requests = await openRegistration(page);
    await fillRegistration(page, {
      ...registration,
      firstName: 'А'.repeat(101),
      password: 'short',
    });

    // Act
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();

    // Assert
    await expect(page.getByText('Не более 100 символов')).toBeVisible();
    await expect(page.getByText('Пароль должен содержать от 8 до 128 символов')).toBeVisible();
    expect(requests).toHaveLength(0);
  });

  test('отклоняет пароль длиннее допустимого до запроса', async ({ page }) => {
    // Arrange
    const requests = await openRegistration(page);
    await fillRegistration(page, { ...registration, password: 'A'.repeat(129) });

    // Act
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();

    // Assert
    await expect(page.getByText('Пароль должен содержать от 8 до 128 символов')).toBeVisible();
    expect(requests).toHaveLength(0);
  });

  test('не отправляет форму с неверным email или несовпадающими паролями', async ({ page }) => {
    // Arrange
    const requests = await openRegistration(page);
    await fillRegistration(page, { ...registration, email: 'anna@' });
    await page.getByLabel('Повторите пароль').fill('OtherPassword123');

    // Act
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();

    // Assert
    await expect(page.getByText('Введите корректный email')).toBeVisible();
    await expect(page.getByText('Пароли не совпадают')).toBeVisible();
    expect(requests).toHaveLength(0);
    await expect(page).toHaveURL('/auth/register');
    await page.getByRole('textbox', { name: 'Email' }).fill(registration.email);
    await page.getByLabel('Повторите пароль').fill(registration.password);
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();
    await expect(page).toHaveURL('/');
    expect(requests).toEqual([registration]);
  });

  test('показывает занятый email и позволяет исправить его', async ({ page }) => {
    // Arrange
    const requests = await openRegistration(page, 409);
    await fillRegistration(page);

    // Act
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();

    // Assert
    await expect(page.getByText('Аккаунт с таким email уже существует')).toBeVisible();
    expect(requests).toEqual([registration]);
    await page.getByRole('textbox', { name: 'Email' }).fill('other@example.test');
    await expect(page.getByText('Аккаунт с таким email уже существует')).toHaveCount(0);
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();
    await expect(page).toHaveURL('/');
    expect(requests).toEqual([registration, { ...registration, email: 'other@example.test' }]);
  });
});
