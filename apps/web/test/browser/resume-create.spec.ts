import { expect, test } from 'playwright/test';

import type { CreateResumeDto } from '../../src/shared/api/generated/types.gen';
import { openTemplateForCreation } from './fixtures/resume-create';

test.describe('Ожидаемое поведение создания резюме', () => {
  test('создаёт резюме из выбранного шаблона и показывает его в списке', async ({ page }) => {
    // Arrange
    const requests = await openTemplateForCreation(page);
    await page.getByRole('button', { name: 'Создать резюме' }).click();
    await page.getByRole('textbox', { name: 'Название' }).fill('  Резюме разработчика  ');
    await page.getByRole('textbox', { name: 'Имя', exact: true }).fill(' Анна ');
    await page.getByRole('textbox', { name: 'Фамилия' }).fill(' Петрова ');
    await page.getByRole('textbox', { name: 'Заголовок' }).fill(' Frontend-разработчик ');
    await page.getByRole('textbox', { name: 'О себе' }).fill(' Разрабатываю интерфейсы. ');

    // Act
    await page.getByRole('button', { name: 'Создать', exact: true }).click();

    // Assert
    await expect(page).toHaveURL(/\/resumes$/);
    await expect(
      page.getByRole('link', { name: 'Открыть резюме Резюме разработчика' }),
    ).toBeVisible();
    const expected: CreateResumeDto = {
      title: 'Резюме разработчика',
      firstName: 'Анна',
      lastName: 'Петрова',
      templateSlug: 'clear-focus',
      headline: 'Frontend-разработчик',
      about: 'Разрабатываю интерфейсы.',
    };
    expect(requests).toEqual([expected]);
  });
});

test.describe('Попытки сломать создание резюме', () => {
  test('гостя направляет на вход без создания', async ({ page }) => {
    // Arrange
    const requests = await openTemplateForCreation(page, { authenticated: false });

    // Act
    await page.getByRole('button', { name: 'Создать резюме' }).click();
    await expect(page).toHaveURL(/\/auth\/login$/);

    // Assert
    expect(requests).toEqual([]);
  });

  test('не отправляет форму с пустыми обязательными полями', async ({ page }) => {
    // Arrange
    const requests = await openTemplateForCreation(page);
    await page.getByRole('button', { name: 'Создать резюме' }).click();

    // Act
    await page.getByRole('button', { name: 'Создать', exact: true }).click();

    // Assert
    await expect(page.getByText('Введите название резюме')).toBeVisible();
    await expect(page.getByText('Введите имя')).toBeVisible();
    await expect(page.getByText('Введите фамилию')).toBeVisible();
    expect(requests).toEqual([]);
  });

  test('сообщает о недоступном шаблоне и оставляет форму открытой', async ({ page }) => {
    // Arrange
    const requests = await openTemplateForCreation(page, { createStatuses: [404] });
    await page.getByRole('button', { name: 'Создать резюме' }).click();
    await page.getByRole('textbox', { name: 'Название' }).fill('Резюме разработчика');
    await page.getByRole('textbox', { name: 'Имя', exact: true }).fill('Анна');
    await page.getByRole('textbox', { name: 'Фамилия' }).fill('Петрова');

    // Act
    await page.getByRole('button', { name: 'Создать', exact: true }).click();

    // Assert
    await expect(page.getByText('Выбранный шаблон больше недоступен.')).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Создать резюме · Clear Focus' })).toBeVisible();
    expect(requests).toHaveLength(1);
  });

  test('позволяет повторить создание после ошибки сервера', async ({ page }) => {
    // Arrange
    const requests = await openTemplateForCreation(page, { createStatuses: [500, 201] });
    await page.getByRole('button', { name: 'Создать резюме' }).click();
    await page.getByRole('textbox', { name: 'Название' }).fill('Резюме разработчика');
    await page.getByRole('textbox', { name: 'Имя', exact: true }).fill('Анна');
    await page.getByRole('textbox', { name: 'Фамилия' }).fill('Петрова');

    // Act
    await page.getByRole('button', { name: 'Создать', exact: true }).click();
    await expect(page.getByText('Не удалось создать резюме. Попробуйте ещё раз.')).toBeVisible();
    await page.getByRole('button', { name: 'Создать', exact: true }).click();

    // Assert
    await expect(page).toHaveURL(/\/resumes$/);
    expect(requests).toHaveLength(2);
  });
});
