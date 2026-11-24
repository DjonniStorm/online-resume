import { type Page, expect, test } from 'playwright/test';

import { openEditor } from './fixture';

function section(page: Page, name: string) {
  return page.locator('.mantine-Accordion-item').filter({ hasText: name });
}

test.describe('Скрытие и восстановление разделов', () => {
  test('скрытый раздел исчезает из редактора и предпросмотра', async ({ page }) => {
    // Arrange
    const editor = await openEditor(page);
    await expect(page.getByRole('article').getByText('Исходный текст о себе')).toBeVisible();

    // Act
    await section(page, 'О себе').getByRole('button', { name: 'Скрыть раздел' }).click();

    // Assert
    await expect(section(page, 'О себе')).toHaveCount(0);
    await expect(page.getByRole('article').getByText('Исходный текст о себе')).toHaveCount(0);
    await expect.poll(() => editor.updates.length).toBeGreaterThan(0);
    expect(editor.updates.at(-1)?.sections).toContainEqual({ type: 'ABOUT', isVisible: false });
  });

  test('возвращает раздел вместе с ранее введённым текстом', async ({ page }) => {
    // Arrange
    const editor = await openEditor(page);
    await section(page, 'О себе').getByRole('button', { name: 'Скрыть раздел' }).click();
    await expect.poll(() => editor.updates.length).toBeGreaterThan(0);

    // Act
    await page.getByRole('combobox', { name: 'Добавить раздел' }).click();
    await page.getByRole('option', { name: 'О себе' }).click();
    await section(page, 'О себе').getByRole('button', { name: 'О себе' }).click();

    // Assert
    await expect(page.getByRole('textbox', { name: 'Текст раздела' })).toHaveValue(
      'Исходный текст о себе',
    );
    await expect(page.getByRole('article').getByText('Исходный текст о себе')).toBeVisible();
    await expect.poll(() => editor.updates.length).toBeGreaterThan(1);
    expect(editor.updates.at(-1)?.sections).toContainEqual({ type: 'ABOUT', isVisible: true });
  });

  test('профиль и контакты остаются обязательными разделами', async ({ page }) => {
    // Arrange
    const editor = await openEditor(page);

    // Act
    const hideButtons = page.getByRole('button', { name: 'Скрыть раздел' });

    // Assert
    await expect(hideButtons).toHaveCount(7);
    await expect(section(page, 'Профиль')).toHaveCount(0);
    await expect(section(page, 'Контакты')).toHaveCount(0);
    expect(editor.saved.sections.filter((item) => !item.isVisible)).toHaveLength(0);
  });
});
