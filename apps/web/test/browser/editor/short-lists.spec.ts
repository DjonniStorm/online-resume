import { type Page, expect, test } from 'playwright/test';

import { openEditor } from './fixture';

async function openSection(page: Page, name: string) {
  const item = page.locator('.mantine-Accordion-item').filter({ hasText: name });
  await item.getByRole('button', { name }).click();
  return item;
}

test.describe('Навыки, языки, проекты и сертификаты', () => {
  test('добавляет и удаляет навык и язык', async ({ page }) => {
    // Arrange
    const editor = await openEditor(page);
    const skills = await openSection(page, 'Навыки');

    // Act
    await skills.getByRole('button', { name: 'Добавить' }).click();
    await skills.getByRole('textbox', { name: 'Навык' }).fill('TypeScript');
    const languages = await openSection(page, 'Языки');
    await languages.getByRole('button', { name: 'Добавить' }).click();
    await languages.getByRole('textbox', { name: 'Язык' }).fill('Русский');
    await expect.poll(() => editor.updates.at(-1)?.languages[0]?.name).toBe('Русский');

    // Assert
    expect(editor.updates.at(-1)?.skills[0]?.name).toBe('TypeScript');
    await openSection(page, 'Навыки');
    await skills.getByRole('button', { name: 'Удалить навык' }).click();
    await openSection(page, 'Языки');
    await languages.getByRole('button', { name: 'Удалить язык' }).click();
    await expect.poll(() => editor.updates.at(-1)?.languages.length).toBe(0);
    expect(editor.updates.at(-1)?.skills).toEqual([]);
  });

  test('сохраняет проект и сертификат с их данными', async ({ page }) => {
    // Arrange
    const editor = await openEditor(page);
    const projects = await openSection(page, 'Проекты');
    const certificates = await openSection(page, 'Сертификаты');

    // Act
    await projects.getByRole('button', { name: 'Добавить' }).click();
    await projects.getByRole('textbox', { name: 'Название' }).fill('Портфолио');
    await projects.getByRole('textbox', { name: 'Ссылка' }).fill('https://example.com');
    await certificates.getByRole('button', { name: 'Добавить' }).click();
    await certificates.getByRole('textbox', { name: 'Название' }).fill('Сертификат');
    await certificates.getByRole('textbox', { name: 'Организация' }).fill('Школа');

    // Assert
    await expect.poll(() => editor.updates.at(-1)?.certificates[0]?.name).toBe('Сертификат');
    expect(editor.updates.at(-1)?.projects).toMatchObject([
      { name: 'Портфолио', url: 'https://example.com' },
    ]);
    expect(editor.updates.at(-1)?.certificates).toMatchObject([
      { name: 'Сертификат', issuer: 'Школа' },
    ]);
  });

  test('пустые добавленные строки не попадают в запрос сохранения', async ({ page }) => {
    // Arrange
    const editor = await openEditor(page);
    for (const name of ['Навыки', 'Языки', 'Проекты', 'Сертификаты']) {
      const item = await openSection(page, name);
      await item.getByRole('button', { name: 'Добавить' }).click();
    }

    // Act
    await page.getByRole('textbox', { name: 'Название резюме' }).fill('Новое название');

    // Assert
    await expect.poll(() => editor.updates.length).toBeGreaterThan(0);
    expect(editor.updates.at(-1)).toMatchObject({
      skills: [],
      languages: [],
      projects: [],
      certificates: [],
    });
  });
});
