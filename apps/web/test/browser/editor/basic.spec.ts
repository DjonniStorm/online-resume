import { expect, test } from 'playwright/test';

import { openEditor, richResume } from './fixture';

test.describe('Основная информация и контакты', () => {
  test('обязательные поля блокируют сохранение, исправление сохраняется', async ({ page }) => {
    // Arrange
    const editor = await openEditor(page);
    await page.getByRole('textbox', { name: 'Название резюме' }).fill(' ');
    await page.getByRole('textbox', { name: 'Имя', exact: true }).fill(' ');
    await page.getByRole('textbox', { name: 'Фамилия' }).fill(' ');

    // Act
    await page.getByRole('button', { name: 'Сохранить изменения' }).click();

    // Assert
    await expect(page.getByText('Введите название резюме')).toBeVisible();
    await expect(page.getByText('Введите имя')).toBeVisible();
    await expect(page.getByText('Введите фамилию')).toBeVisible();
    expect(editor.updates).toHaveLength(0);
    await page.getByRole('textbox', { name: 'Название резюме' }).fill('  Исправленное резюме  ');
    await page.getByRole('textbox', { name: 'Имя', exact: true }).fill('  Мария  ');
    await page.getByRole('textbox', { name: 'Фамилия' }).fill('  Иванова  ');
    await expect.poll(() => editor.updates.length).toBeGreaterThan(0);
    await expect(page.getByRole('button', { name: 'Сохранить изменения' })).toBeDisabled();
    expect(editor.updates.at(-1)).toMatchObject({
      title: 'Исправленное резюме',
      firstName: 'Мария',
      lastName: 'Иванова',
    });
  });

  test('короткие GitHub и сайт превращаются в рабочие ссылки', async ({ page }) => {
    // Arrange
    const editor = await openEditor(page);

    // Act
    await page.getByRole('textbox', { name: 'GitHub' }).fill('octocat');
    await page.getByRole('textbox', { name: 'Сайт' }).fill('example.com');
    await page.getByRole('textbox', { name: 'Telegram' }).fill('@sample_user');

    // Assert
    await expect.poll(() => editor.updates.length).toBeGreaterThan(0);
    expect(editor.updates.at(-1)).toMatchObject({
      githubUrl: 'https://github.com/octocat',
      websiteUrl: 'https://example.com',
      telegramHandle: '@sample_user',
    });
    await expect(page.locator('a[href="https://github.com/octocat"]')).toBeVisible();
    await expect(page.locator('a[href="https://example.com"]')).toBeVisible();
    await expect(page.locator('a[href="https://t.me/sample_user"]')).toBeVisible();
  });

  test('полные ссылки сохраняются, а HTTP GitHub переводится на HTTPS', async ({ page }) => {
    // Arrange
    const editor = await openEditor(page);

    // Act
    await page.getByRole('textbox', { name: 'GitHub' }).fill('http://github.com/octocat');
    await page.getByRole('textbox', { name: 'Сайт' }).fill('https://portfolio.example.com');

    // Assert
    await expect.poll(() => editor.updates.length).toBeGreaterThan(0);
    expect(editor.updates.at(-1)).toMatchObject({
      githubUrl: 'https://github.com/octocat',
      websiteUrl: 'https://portfolio.example.com',
    });
    await page.reload();
    await expect(page.getByRole('textbox', { name: 'GitHub' })).toHaveValue(
      'https://github.com/octocat',
    );
    expect(editor.saved.title).toBe(richResume.title);
  });
});
