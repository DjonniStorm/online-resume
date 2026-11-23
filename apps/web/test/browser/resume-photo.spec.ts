import { type Page, expect, test } from 'playwright/test';

import type { ResumeDto } from '../../src/shared/api/generated/types.gen';
import { editorResume, editorResumeId, session } from './fixtures/editor';

const maxPhotoBytes = 5 * 1024 * 1024;
// Изолированное изображение 1×1 пиксель для браузерной загрузки.
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=',
  'base64',
);

async function openEditor(page: Page) {
  let resume: ResumeDto = structuredClone(editorResume);
  const uploads: Buffer[] = [];
  let deletions = 0;

  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/auth/refresh') {
      await route.fulfill({ json: session });
      return;
    }
    if (path === '/api/resumes/deletions/notices') {
      await route.fulfill({ json: [] });
      return;
    }
    if (path === `/api/resumes/${editorResumeId}`) {
      await route.fulfill({ json: resume });
      return;
    }
    if (path === `/api/resumes/${editorResumeId}/photo`) {
      if (route.request().method() === 'POST') {
        uploads.push(route.request().postDataBuffer() ?? Buffer.alloc(0));
        resume = { ...resume, photoPath: 'uploaded-photo.png', revision: resume.revision + 1 };
        await route.fulfill({ json: resume });
        return;
      }
      if (route.request().method() === 'GET') {
        await route.fulfill({ body: png, contentType: 'image/png' });
        return;
      }
      if (route.request().method() === 'DELETE') {
        deletions += 1;
        resume = { ...resume, photoPath: null, revision: resume.revision + 1 };
        await route.fulfill({ json: resume });
        return;
      }
    }
    throw new Error(`Неожиданный запрос API: ${route.request().method()} ${path}`);
  });

  await page.goto(`/resumes/${editorResumeId}/edit`);
  const image = page.getByRole('img', { name: 'Фотография резюме' });
  await expect(image).toHaveAttribute('src', '/resume-photo-fallback.svg');
  return {
    image,
    uploads,
    get deletions() {
      return deletions;
    },
  };
}

test.describe('Ожидаемое поведение фотографии', () => {
  test('показывает fallback, загружает фото и возвращает fallback после удаления', async ({
    page,
  }) => {
    // Arrange
    const photo = await openEditor(page);

    // Act
    await page.locator('input[type="file"]').setInputFiles({
      name: 'photo.png',
      mimeType: 'image/png',
      buffer: png,
    });

    // Assert
    await expect(page.getByRole('button', { name: 'Заменить фото' })).toBeVisible();
    await expect(photo.image).toHaveAttribute('src', /^blob:/);
    expect(photo.uploads).toHaveLength(1);
    expect(photo.uploads[0]?.includes(png)).toBe(true);
    await page.getByRole('button', { name: 'Удалить' }).click();
    await expect(photo.image).toHaveAttribute('src', '/resume-photo-fallback.svg');
    await expect(page.getByRole('button', { name: 'Добавить фото' })).toBeVisible();
    expect(photo.deletions).toBe(1);
  });
});

test.describe('Попытки сломать загрузку фотографии', () => {
  test('не отправляет неподдерживаемый, пустой и слишком большой файл', async ({ page }) => {
    // Arrange
    const photo = await openEditor(page);

    // Act
    await page.locator('input[type="file"]').setInputFiles({
      name: 'notes.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not a photo'),
    });

    // Assert
    await expect(page.getByText('Поддерживаются только JPEG, PNG и WebP.')).toBeVisible();
    expect(photo.uploads).toHaveLength(0);
    await page.locator('input[type="file"]').setInputFiles({
      name: 'empty.png',
      mimeType: 'image/png',
      buffer: Buffer.alloc(0),
    });
    await expect(page.getByText('Размер фотографии должен быть от 1 байта до 5 МБ.')).toBeVisible();
    expect(photo.uploads).toHaveLength(0);
    await page.locator('input[type="file"]').setInputFiles({
      name: 'large.png',
      mimeType: 'image/png',
      buffer: Buffer.alloc(maxPhotoBytes + 1),
    });
    await expect(page.getByText('Размер фотографии должен быть от 1 байта до 5 МБ.')).toBeVisible();
    expect(photo.uploads).toHaveLength(0);
    await expect(photo.image).toHaveAttribute('src', '/resume-photo-fallback.svg');
  });
});
