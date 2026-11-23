import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createHttpTestingApp } from '../../../../test/create-http-testing-app';
import { createResumePhotoFixture, photoPng } from './resume-photo.fixture';

let app: Awaited<ReturnType<typeof createHttpTestingApp>>;
let fixture: Awaited<ReturnType<typeof createResumePhotoFixture>>;
let photoDirectory: string | undefined;

const pngMimeType = 'image/png';

beforeAll(async () => {
  photoDirectory = await mkdtemp(join(tmpdir(), 'online-resume-photo-'));
  app = await createHttpTestingApp({ photoDirectory });
});

beforeEach(async () => {
  fixture = await createResumePhotoFixture(app);
  return fixture.cleanup;
});

afterAll(async () => {
  try {
    await app?.close();
  } finally {
    if (photoDirectory) {
      await rm(photoDirectory, { recursive: true, force: true });
    }
  }
});

function pngFile(): File {
  return new File([photoPng], 'photo.png', { type: pngMimeType });
}

describe('Ожидаемое поведение', () => {
  it('сохраняет и отдаёт PNG без изменений', async () => {
    // Arrange
    const file: File = pngFile();

    // Act
    const uploaded = await fixture.upload(file);
    const downloaded = await fixture.read();

    // Assert
    expect(uploaded.status).toBe(200);
    expect(downloaded.status).toBe(200);
    expect(downloaded.headers.get('content-type')).toBe(pngMimeType);
    expect(Buffer.from(await downloaded.arrayBuffer())).toEqual(photoPng);
  });

  it('после удаления фото возвращает 404', async () => {
    // Arrange
    const uploaded = await fixture.upload(pngFile());
    expect(uploaded.status).toBe(200);

    // Act
    const removed = await fixture.remove();
    const downloaded = await fixture.read();

    // Assert
    expect(removed.status).toBe(200);
    expect(downloaded.status).toBe(404);
  });
});

describe('Попытки сломать загрузку', () => {
  it('отклоняет текст под видом PNG и сохраняет старое фото', async () => {
    // Arrange
    const uploaded = await fixture.upload(pngFile());
    expect(uploaded.status).toBe(200);
    const invalidFile: File = new File(['Обычный текст'], 'photo.png', { type: pngMimeType });

    // Act
    const rejected = await fixture.upload(invalidFile);
    const downloaded = await fixture.read();

    // Assert
    expect(rejected.status).toBe(400);
    expect(downloaded.status).toBe(200);
    expect(Buffer.from(await downloaded.arrayBuffer())).toEqual(photoPng);
  });
});
