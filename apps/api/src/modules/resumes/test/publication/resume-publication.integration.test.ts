import { NotFoundException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaService } from '../../../../database/prisma.service';
import { RESUME_DELETION_DAYS } from '../../common/deletion';
import { ResumeCleanupService } from '../../resume-cleanup.service';
import { ResumePhotoStorageService } from '../../resume-photo-storage.service';
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
const cleanupWaitMs = 5_000;

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

  it('отменяет очередь удаления и сохраняет публичную ссылку после срока', async () => {
    // Arrange
    const { publicSlug } = await resumes.publish(ownerId, resumeId);
    const { scheduledFor } = await resumes.scheduleRemove(ownerId, resumeId);
    const queued = await resumes.findOne(ownerId, resumeId);
    const overview = await resumes.overview(ownerId);

    // Act
    await resumes.cancelRemove(ownerId, resumeId);
    vi.setSystemTime(expiresAt);
    const published = await resumes.findPublic(publicSlug);

    // Assert
    expect(scheduledFor).toEqual(expiresAt);
    expect(queued.deletionScheduledAt).toEqual(expiresAt);
    expect(overview.scheduledLinks).toMatchObject([
      { id: resumeId, kind: 'delete', scheduledFor: expiresAt },
    ]);
    expect(published.id).toBe(resumeId);
    expect(await prisma.resumeDeletion.findUnique({ where: { resumeId } })).toBeNull();
  });

  it('после немедленного удаления показывает уведомление один раз', async () => {
    // Arrange
    const { publicSlug } = await resumes.publish(ownerId, resumeId);
    await resumes.scheduleRemove(ownerId, resumeId);

    // Act
    await resumes.remove(ownerId, resumeId);
    const notices = await resumes.deletionNotices(ownerId);
    const publicRequest = resumes.findPublic(publicSlug);
    await resumes.dismissDeletionNotices(ownerId);

    // Assert
    await expect(publicRequest).rejects.toBeInstanceOf(NotFoundException);
    expect(notices).toMatchObject([{ resumeId, title: fixture?.input.title }]);
    expect(await resumes.deletionNotices(ownerId)).toEqual([]);
    expect(await prisma.resume.findUnique({ where: { id: resumeId } })).toMatchObject({
      isPublished: false,
      publicSlug: null,
    });
  });

  it('снимает резюме в срок и окончательно удаляет через 30 дней', async () => {
    // Arrange
    const { publicSlug } = await resumes.publish(ownerId, resumeId);
    await resumes.scheduleRemove(ownerId, resumeId);
    if (!moduleRef) {
      throw new Error('Тестовый модуль не запущен.');
    }
    const photos = moduleRef.get(ResumePhotoStorageService);
    const cleanup = new ResumeCleanupService(prisma, photos);

    // Act
    vi.setSystemTime(expiresAt);
    cleanup.onModuleInit();
    try {
      await vi.waitFor(
        async () => {
          expect(await prisma.resume.findUnique({ where: { id: resumeId } })).toMatchObject({
            isPublished: false,
            publicSlug: null,
            deletedAt: expiresAt,
          });
        },
        { timeout: cleanupWaitMs },
      );
    } finally {
      cleanup.onModuleDestroy();
    }
    const notice = await resumes.deletionNotices(ownerId);
    const permanentlyDeleteAt = new Date(expiresAt);
    permanentlyDeleteAt.setUTCDate(permanentlyDeleteAt.getUTCDate() + RESUME_DELETION_DAYS);
    vi.setSystemTime(permanentlyDeleteAt);
    cleanup.onModuleInit();
    try {
      await vi.waitFor(
        async () => {
          expect(await prisma.resume.findUnique({ where: { id: resumeId } })).toBeNull();
        },
        { timeout: cleanupWaitMs },
      );
    } finally {
      cleanup.onModuleDestroy();
    }

    // Assert
    expect(notice).toMatchObject([{ resumeId }]);
    await expect(resumes.findPublic(publicSlug)).rejects.toBeInstanceOf(NotFoundException);
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
