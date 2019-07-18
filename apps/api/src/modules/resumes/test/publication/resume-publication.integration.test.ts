import { NotFoundException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaService } from '../../../../database/prisma.service';
import { ResumesService } from '../../resumes.service';
import { createResumeTestingModule } from '../create-resume-testing-module';
import { createResumePublicationFixture } from './resume-publication.fixture';

let moduleRef: TestingModule | undefined;
let fixture: Awaited<ReturnType<typeof createResumePublicationFixture>> | undefined;
let resumes: ResumesService;
let prisma: PrismaService;
let ownerId: string;
let resumeId: string;

const publishedAt = new Date('2026-01-30T12:00:00Z');
const expiresAt = new Date('2026-02-02T12:00:00Z');
const justBeforeExpiry = new Date('2026-02-02T11:59:59Z');

beforeAll(async () => {
  moduleRef = await createResumeTestingModule();
  prisma = moduleRef.get(PrismaService);
  resumes = moduleRef.get(ResumesService);
});

beforeEach(async () => {
  fixture = await createResumePublicationFixture(prisma);
  ownerId = fixture.ownerId;
  const resume = await resumes.create(ownerId, fixture.input);
  resumeId = resume.id;
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(publishedAt);
});

afterEach(async () => {
  vi.useRealTimers();
  await fixture?.cleanup();
  fixture = undefined;
});

afterAll(async () => {
  await moduleRef?.close();
});

describe('Ожидаемое поведение', () => {
  it('сохраняет ссылку при отмене снятия', async () => {
    // Arrange
    const { publicSlug } = await resumes.publish(ownerId, resumeId);
    await resumes.scheduleUnpublish(ownerId, resumeId);
    vi.setSystemTime(justBeforeExpiry);

    // Act
    await resumes.cancelUnpublish(ownerId, resumeId);
    vi.setSystemTime(expiresAt);
    const published = await resumes.findPublic(publicSlug);

    // Assert
    expect(published).toMatchObject({ id: resumeId, unpublishAt: null });
  });
});

describe('Попытки сломать публикацию', () => {
  it.each(['снятие', 'удаление'] as const)(
    'отключает ссылку точно в срок: %s',
    async (operation) => {
      // Arrange
      const { publicSlug } = await resumes.publish(ownerId, resumeId);
      const { scheduledFor } =
        operation === 'снятие'
          ? await resumes.scheduleUnpublish(ownerId, resumeId)
          : await resumes.scheduleRemove(ownerId, resumeId);
      vi.setSystemTime(justBeforeExpiry);

      // Act
      const beforeExpiry = await resumes.findPublic(publicSlug);
      vi.setSystemTime(expiresAt);
      const afterExpiry = resumes.findPublic(publicSlug);

      // Assert
      await expect(afterExpiry).rejects.toBeInstanceOf(NotFoundException);
      expect(beforeExpiry.id).toBe(resumeId);
      expect(scheduledFor).toEqual(expiresAt);
    },
  );

  it('отключает ссылку при удалении без ожидания', async () => {
    // Arrange
    const { publicSlug } = await resumes.publish(ownerId, resumeId);
    await resumes.scheduleRemove(ownerId, resumeId);

    // Act
    await resumes.remove(ownerId, resumeId);
    const published = resumes.findPublic(publicSlug);

    // Assert
    await expect(published).rejects.toBeInstanceOf(NotFoundException);
  });
});
