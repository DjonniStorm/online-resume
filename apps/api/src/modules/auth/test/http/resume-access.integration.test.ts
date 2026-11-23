import type { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createHttpTestingApp } from '../../../../test/create-http-testing-app';
import type { ResumeDto } from '../../../resumes/dto/resume-detail.dto';
import type { UpdateResumeDto } from '../../../resumes/dto/update-resume.dto';
import { createResumeAccessFixture } from './resume-access.fixture';

let app: INestApplication | undefined;
let fixture: Awaited<ReturnType<typeof createResumeAccessFixture>>;

beforeAll(async () => {
  app = await createHttpTestingApp();
});

beforeEach(async () => {
  if (!app) {
    throw new Error('Тестовый HTTP-сервер не запущен.');
  }
  fixture = await createResumeAccessFixture(app);
  return fixture.cleanup;
});

afterAll(async () => {
  await app?.close();
});

describe('Ожидаемое поведение', () => {
  it('владелец читает своё резюме', async () => {
    // Arrange
    const { url, owner, resume } = fixture;
    const request: RequestInit = { headers: { Authorization: `Bearer ${owner.accessToken}` } };

    // Act
    const response = await fetch(url, request);

    // Assert
    expect(response.status).toBe(200);
    const expected: Pick<ResumeDto, 'id' | 'title'> = { id: resume.id, title: resume.title };
    expect(await response.json()).toMatchObject(expected);
  });
});

describe('Попытки обойти защиту', () => {
  it('отклоняет запрос без токена', async () => {
    // Arrange
    const { url } = fixture;

    // Act
    const response = await fetch(url);

    // Assert
    expect(response.status).toBe(401);
  });

  it('не даёт изменить чужое резюме', async () => {
    // Arrange
    const { url, owner, otherUser, resume } = fixture;
    const input: UpdateResumeDto = {
      revision: resume.revision,
      title: 'Изменённый заголовок',
      firstName: resume.firstName,
      lastName: resume.lastName,
      sections: [],
      experiences: [],
      educations: [],
      skills: [],
      languages: [],
      projects: [],
      certificates: [],
    };
    const request: RequestInit = {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${otherUser.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    };

    // Act
    const response = await fetch(url, request);
    const saved = await fetch(url, { headers: { Authorization: `Bearer ${owner.accessToken}` } });

    // Assert
    expect(response.status).toBe(404);
    expect(saved.status).toBe(200);
    const expected: Pick<ResumeDto, 'title' | 'revision'> = {
      title: resume.title,
      revision: resume.revision,
    };
    expect(await saved.json()).toMatchObject(expected);
  });
});
