import { type Page, expect, test } from 'playwright/test';

import type { ResumeDto, UpdateResumeDto } from '../../../src/shared/api/generated/types.gen';
import { editorResume, editorResumeId, session } from '../fixtures/editor';

async function openEditor(page: Page, failSave = false) {
  let savedResume: ResumeDto = structuredClone(editorResume);
  const updates: UpdateResumeDto[] = [];

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/auth/refresh') {
      await route.fulfill({ json: session });
      return;
    }
    if (url.pathname === '/api/resumes/deletions/notices') {
      await route.fulfill({ json: [] });
      return;
    }
    if (url.pathname === `/api/resumes/${editorResumeId}`) {
      if (route.request().method() === 'GET') {
        await route.fulfill({ json: savedResume });
        return;
      }
      if (route.request().method() === 'PATCH') {
        const update = route.request().postDataJSON() as UpdateResumeDto;
        updates.push(update);
        if (failSave) {
          await route.fulfill({ status: 409, json: { message: 'Конфликт версий' } });
          return;
        }
        savedResume = { ...savedResume, title: update.title, revision: savedResume.revision + 1 };
        await route.fulfill({ json: savedResume });
        return;
      }
    }
    throw new Error(`Неожиданный запрос API: ${route.request().method()} ${url.pathname}`);
  });

  await page.goto(`/resumes/${editorResumeId}/edit`);
  await expect(page.getByRole('textbox', { name: 'Название резюме' })).toHaveValue(
    editorResume.title,
  );
  return { updates };
}

test.describe('Ожидаемое поведение автосохранения', () => {
  test('сохраняет изменение и показывает его после обновления страницы', async ({ page }) => {
    // Arrange
    const { updates } = await openEditor(page);
    const title = 'Обновлённое резюме';

    // Act
    await page.getByRole('textbox', { name: 'Название резюме' }).fill(title);
    await expect.poll(() => updates.length).toBe(1);
    await expect(page.getByRole('button', { name: 'Сохранить изменения' })).toBeDisabled();
    await page.reload();

    // Assert
    expect(updates[0]?.title).toBe(title);
    expect(updates[0]?.revision).toBe(editorResume.revision);
    await expect(page.getByRole('textbox', { name: 'Название резюме' })).toHaveValue(title);
  });
});

test.describe('Попытки сломать автосохранение', () => {
  test('при конфликте версий показывает ошибку и не считает изменение сохранённым', async ({
    page,
  }) => {
    // Arrange
    const { updates } = await openEditor(page, true);

    // Act
    await page.getByRole('textbox', { name: 'Название резюме' }).fill('Несохранённое резюме');

    // Assert
    await expect.poll(() => updates.length).toBe(1);
    await expect(page.getByText('Не удалось сохранить резюме')).toBeVisible();
    await expect(page.getByText('Резюме изменилось в другой вкладке.')).toBeVisible();
    await page.reload();
    await expect(page.getByRole('textbox', { name: 'Название резюме' })).toHaveValue(
      editorResume.title,
    );
  });
});
