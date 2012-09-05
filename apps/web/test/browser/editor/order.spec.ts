import { type Page, expect, test } from 'playwright/test';

import { openEditor } from './fixture';

function section(page: Page, name: string) {
  return page.locator('.mantine-Accordion-item').filter({ hasText: name });
}

test.describe('Порядок разделов внутри колонок', () => {
  test('перемещение вверх сохраняет новый порядок после перезагрузки', async ({ page }) => {
    // Arrange
    const editor = await openEditor(page);

    // Act
    await section(page, 'Опыт работы')
      .getByRole('button', { name: 'Переместить раздел выше' })
      .click();

    // Assert
    await expect.poll(() => editor.updates.length).toBeGreaterThan(0);
    const types = editor.updates.at(-1)?.sections.map((item) => item.type);
    expect(types?.slice(2, 4)).toEqual(['EXPERIENCE', 'ABOUT']);
    await page.reload();
    const names = await page.locator('.mantine-Accordion-item').allTextContents();
    expect(names[0]).toContain('Опыт работы');
    expect(names[1]).toContain('О себе');
  });

  test('перемещение вниз меняет порядок только выбранной колонки', async ({ page }) => {
    // Arrange
    const editor = await openEditor(page);

    // Act
    await section(page, 'Навыки').getByRole('button', { name: 'Переместить раздел ниже' }).click();

    // Assert
    await expect.poll(() => editor.updates.length).toBeGreaterThan(0);
    const types = editor.updates.at(-1)?.sections.map((item) => item.type);
    expect(types?.slice(6, 8)).toEqual(['LANGUAGES', 'SKILLS']);
    expect(types?.slice(2, 4)).toEqual(['ABOUT', 'EXPERIENCE']);
  });

  test('на границах кнопки выключены и раздел не перескакивает между колонками', async ({
    page,
  }) => {
    // Arrange
    const editor = await openEditor(page);

    // Act
    const firstMain = section(page, 'О себе');
    const lastMain = section(page, 'Проекты');
    const firstSidebar = section(page, 'Навыки');

    // Assert
    await expect(firstMain.getByRole('button', { name: 'Переместить раздел выше' })).toBeDisabled();
    await expect(lastMain.getByRole('button', { name: 'Переместить раздел ниже' })).toBeDisabled();
    await expect(
      firstSidebar.getByRole('button', { name: 'Переместить раздел выше' }),
    ).toBeDisabled();
    expect(editor.updates).toHaveLength(0);
  });
});
