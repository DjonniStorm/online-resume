import { type Page, expect, test } from 'playwright/test';

import { openEditor } from './fixture';

async function openSection(page: Page, name: string) {
  const item = page.locator('.mantine-Accordion-item').filter({ hasText: name });
  await item.getByRole('button', { name }).click();
  return item;
}

test.describe('Опыт работы и образование', () => {
  test('добавляет опыт с текущей работой и сохраняет данные', async ({ page }) => {
    // Arrange
    const editor = await openEditor(page);
    const item = await openSection(page, 'Опыт работы');

    // Act
    await item.getByRole('button', { name: 'Добавить' }).click();
    await item.getByRole('textbox', { name: 'Компания' }).fill('Тестовая компания');
    await item.getByRole('textbox', { name: 'Должность' }).fill('Разработчик');
    await item.getByRole('checkbox', { name: 'Работаю сейчас' }).check();

    // Assert
    await expect(item.getByRole('textbox', { name: 'Окончание' })).toBeDisabled();
    await expect.poll(() => editor.updates.length).toBeGreaterThan(0);
    expect(editor.updates.at(-1)?.experiences).toMatchObject([
      { company: 'Тестовая компания', position: 'Разработчик', isCurrent: true },
    ]);
  });

  test('добавляет, меняет и удаляет образование', async ({ page }) => {
    // Arrange
    const editor = await openEditor(page);
    const item = await openSection(page, 'Образование');
    await item.getByRole('button', { name: 'Добавить' }).click();
    await item.getByRole('textbox', { name: 'Учебное заведение' }).fill('Университет');
    await expect.poll(() => editor.updates.length).toBeGreaterThan(0);

    // Act
    await item.getByRole('textbox', { name: 'Учебное заведение' }).fill('Новый университет');
    await expect.poll(() => editor.updates.length).toBeGreaterThan(1);
    await item.getByRole('button', { name: 'Удалить образование' }).click();

    // Assert
    await expect.poll(() => editor.updates.length).toBeGreaterThan(2);
    expect(editor.updates.at(-2)?.educations[0]?.institution).toBe('Новый университет');
    expect(editor.updates.at(-1)?.educations).toEqual([]);
    await expect(item.getByRole('textbox', { name: 'Учебное заведение' })).toHaveCount(0);
  });

  test('частично заполненный опыт не отправляется до исправления', async ({ page }) => {
    // Arrange
    const editor = await openEditor(page);
    const item = await openSection(page, 'Опыт работы');
    await item.getByRole('button', { name: 'Добавить' }).click();
    await item.getByRole('textbox', { name: 'Компания' }).fill('Компания');

    // Act
    await page.getByRole('button', { name: 'Сохранить изменения' }).click();

    // Assert
    await expect(item.getByText('Заполните обязательное поле')).toBeVisible();
    expect(editor.updates).toHaveLength(0);
    await item.getByRole('textbox', { name: 'Должность' }).fill('Разработчик');
    await expect.poll(() => editor.updates.length).toBeGreaterThan(0);
    expect(editor.updates.at(-1)?.experiences[0]?.position).toBe('Разработчик');
  });
});
