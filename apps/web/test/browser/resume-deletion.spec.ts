import { expect, test } from 'playwright/test';

import { prepareResumeHome } from './fixtures/resume-home';

test.describe('Ожидаемое поведение очереди удаления', () => {
  test('показывает срок на главной и позволяет отменить удаление', async ({ page }) => {
    // Arrange
    const { actions, firstId } = await prepareResumeHome(page);
    await page.goto('/resumes');
    await page.getByRole('button', { name: 'Действия с резюме Первое резюме' }).click();
    await page.getByRole('menuitem', { name: 'Удалить' }).click();

    // Act
    await page.getByRole('button', { name: 'Удалить через 3 дня' }).click();
    await expect(page.getByText('Удаление запланировано')).toBeVisible();
    await page.goto('/');
    await expect(page.getByText('Отключение публичных ссылок')).toBeVisible();
    await page.getByRole('button', { name: 'Отменить', exact: true }).click();

    // Assert
    await expect(page.getByText('Отключение публичных ссылок')).toHaveCount(0);
    expect(actions).toContain(`POST /api/resumes/${firstId}/deletion-schedule`);
    expect(actions).toContain(`DELETE /api/resumes/${firstId}/deletion-schedule`);
    await page.goto('/resumes');
    await expect(page.getByText('Удаление запланировано')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Открыть резюме Первое резюме' })).toBeVisible();
  });

  test('сразу удаляет резюме и показывает уведомление о ссылке', async ({ page }) => {
    // Arrange
    const { actions, firstId } = await prepareResumeHome(page);
    await page.goto('/resumes');
    await page.getByRole('button', { name: 'Действия с резюме Первое резюме' }).click();
    await page.getByRole('menuitem', { name: 'Удалить' }).click();

    // Act
    await page.getByRole('button', { name: 'Удалить сейчас' }).click();

    // Assert
    await expect(page.getByRole('link', { name: 'Открыть резюме Первое резюме' })).toHaveCount(0);
    await expect(page.getByText('Публичные ссылки больше не работают')).toBeVisible();
    expect(actions).toContain(`DELETE /api/resumes/${firstId}`);
    await page
      .getByRole('alert', { name: 'Публичные ссылки больше не работают' })
      .getByRole('button')
      .click();
    await expect(page.getByText('Публичные ссылки больше не работают')).toHaveCount(0);
    expect(actions).toContain('POST /api/resumes/deletions/notices/dismiss');
  });
});

test.describe('Попытки сломать очередь удаления', () => {
  test('ошибка сервера оставляет резюме и позволяет повторить действие', async ({ page }) => {
    // Arrange
    const { actions, firstId } = await prepareResumeHome(page, { scheduleFails: true });
    await page.goto('/resumes');
    await page.getByRole('button', { name: 'Действия с резюме Первое резюме' }).click();
    await page.getByRole('menuitem', { name: 'Удалить' }).click();

    // Act
    await page.getByRole('button', { name: 'Удалить через 3 дня' }).click();

    // Assert
    await expect(page.getByText('Не удалось удалить резюме. Попробуйте ещё раз.')).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Удалить резюме?' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Удалить через 3 дня' })).toBeEnabled();
    expect(actions).toContain(`POST /api/resumes/${firstId}/deletion-schedule`);
    await page.getByRole('button', { name: 'Отмена' }).click();
    await expect(page.getByRole('link', { name: 'Открыть резюме Первое резюме' })).toBeVisible();
    await expect(page.getByText('Удаление запланировано')).toHaveCount(0);
  });
});
