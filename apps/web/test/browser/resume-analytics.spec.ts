import { expect, test } from 'playwright/test';

import { prepareResumeHome } from './fixtures/resume-home';

test.describe('Ожидаемое поведение статистики просмотров', () => {
  test('фильтрует просмотры по резюме и возвращается к общей статистике', async ({ page }) => {
    // Arrange
    const { secondId } = await prepareResumeHome(page);
    await page.goto('/');
    await expect(page.getByText('За всё время: 5')).toBeVisible();

    // Act
    await page.getByRole('combobox', { name: 'Резюме для статистики' }).click();
    await page.getByRole('option', { name: 'Второе резюме' }).click();

    // Assert
    await expect(page).toHaveURL(new RegExp(`resumeId=${secondId}`));
    await expect(page.getByText('За всё время: 3')).toBeVisible();
    await expect(
      page.getByRole('group', { name: 'Посещения публичных резюме по дням за последние 7 дней' }),
    ).toBeVisible();
    await page.getByRole('combobox', { name: 'Резюме для статистики' }).click();
    await page.getByRole('option', { name: 'Все резюме' }).click();
    await expect(page).not.toHaveURL(/resumeId=/);
    await expect(page.getByText('За всё время: 5')).toBeVisible();
  });
});
