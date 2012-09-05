import { expect, test } from 'playwright/test';

import { alternativeTemplate, editorTemplate, openEditor, richResume } from './fixture';

test.describe('Смена шаблона и переход в предпросмотр', () => {
  test('ищет и применяет шаблон, сохраняя данные резюме', async ({ page }) => {
    // Arrange
    const editor = await openEditor(page);
    await page.getByRole('textbox', { name: 'Название резюме' }).fill('Обновлённое название');
    await expect.poll(() => editor.updates.length).toBeGreaterThan(0);

    // Act
    await page.getByRole('button', { name: 'Изменить шаблон' }).click();
    const modal = page.getByRole('dialog', { name: 'Изменить шаблон' });
    await modal.getByRole('textbox', { name: 'Поиск шаблонов' }).fill('Другой');
    await modal.getByRole('button', { name: 'Найти' }).click();
    await modal
      .getByRole('button', { name: `Посмотреть шаблон ${alternativeTemplate.name}` })
      .click();
    await modal.getByRole('button', { name: 'Применить' }).click();

    // Assert
    await expect(modal).toHaveCount(0);
    await expect(page.getByRole('textbox', { name: 'Название резюме' })).toHaveValue(
      'Обновлённое название',
    );
    await expect(page.getByRole('article')).toHaveAttribute('data-spacing', /.+/);
    expect(editor.templateChanges).toContainEqual({
      revision: richResume.revision + 1,
      templateSlug: alternativeTemplate.slug,
    });
    expect(editor.saved.template.slug).toBe(alternativeTemplate.slug);
    expect(editor.saved.about).toBe('Исходный текст о себе');
  });

  test('ошибка смены оставляет прежний шаблон и предупреждает о несохранённых правках', async ({
    page,
  }) => {
    // Arrange
    const editor = await openEditor(page, { templateStatus: 409 });
    await page.getByRole('textbox', { name: 'Название резюме' }).fill('Несохранённый заголовок');
    await page.getByRole('button', { name: 'Изменить шаблон' }).click();
    const modal = page.getByRole('dialog', { name: 'Изменить шаблон' });
    await expect(modal.getByText('Несохранённые изменения', { exact: true })).toBeVisible();
    await modal
      .getByRole('button', { name: `Посмотреть шаблон ${alternativeTemplate.name}` })
      .click();

    // Act
    await modal.getByRole('button', { name: 'Применить' }).click();

    // Assert
    await expect(modal.getByText('Не удалось изменить шаблон')).toBeVisible();
    await expect(modal).toBeVisible();
    expect(editor.saved.template.slug).toBe(editorTemplate.slug);
    expect(editor.saved.title).not.toBe('Несохранённый заголовок');
    expect(editor.templateChanges).toHaveLength(1);
  });

  test('переход сохраняет правки, а неверная форма остаётся в редакторе', async ({ page }) => {
    // Arrange
    const editor = await openEditor(page);
    await page.getByRole('textbox', { name: 'Название резюме' }).fill(' ');

    // Act
    await page.getByRole('button', { name: 'Сохранить и открыть предпросмотр' }).click();

    // Assert
    await expect(page.getByText('Введите название резюме')).toBeVisible();
    await expect(page).toHaveURL(/\/edit$/);
    expect(editor.updates).toHaveLength(0);
    await page.getByRole('textbox', { name: 'Название резюме' }).fill('Готовый вариант');
    await page.getByRole('button', { name: 'Сохранить и открыть предпросмотр' }).click();
    await expect(page).toHaveURL(/\/preview$/);
    expect(editor.updates.at(-1)?.title).toBe('Готовый вариант');
    await expect(page.getByRole('heading', { name: 'Готовый вариант' })).toBeVisible();
  });
});
