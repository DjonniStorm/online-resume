import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { RESUME_CLEANUP_INTERVAL_MS, resumeDeleteAfter } from './common/deletion';
import { ResumePhotoStorageService } from './resume-photo-storage.service';

@Injectable()
export class ResumeCleanupService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ResumeCleanupService.name);
  private timer: ReturnType<typeof setInterval> | null = null;
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly photos: ResumePhotoStorageService,
  ) {}

  onModuleInit(): void {
    if (process.env.RESUME_CLEANUP_DISABLED === 'true') {
      return;
    }
    void this.cleanup();
    this.timer = setInterval(() => void this.cleanup(), RESUME_CLEANUP_INTERVAL_MS);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private async cleanup(): Promise<void> {
    if (this.running) {
      return;
    }
    this.running = true;
    try {
      const now = new Date();
      await this.prisma.resume.updateMany({
        where: { deletedAt: null, unpublishAt: { lte: now } },
        data: { isPublished: false, publishedAt: null, unpublishAt: null },
      });
      const scheduled = await this.prisma.resumeDeletion.findMany({
        where: { scheduledFor: { lte: now }, resume: { deletedAt: null } },
        select: { resumeId: true },
      });
      for (const item of scheduled) {
        try {
          await this.prisma.$transaction(async (transaction) => {
            const updated = await transaction.resume.updateMany({
              where: {
                id: item.resumeId,
                deletedAt: null,
                deletion: { scheduledFor: { lte: now } },
              },
              data: {
                deletedAt: now,
                isPublished: false,
                publishedAt: null,
                unpublishAt: null,
                publicSlug: null,
              },
            });
            if (updated.count === 1) {
              await transaction.resumeDeletion.update({
                where: { resumeId: item.resumeId },
                data: { scheduledFor: null, deleteAfter: resumeDeleteAfter(now) },
              });
            }
          });
        } catch (error) {
          this.logger.error(`Не удалось снять резюме ${item.resumeId} с публикации`, error);
        }
      }
      const pending = await this.prisma.resumeDeletion.findMany({
        where: { scheduledFor: null, deleteAfter: { lte: now } },
        select: { resumeId: true, resume: { select: { photoPath: true } } },
        orderBy: { deleteAfter: 'asc' },
      });

      for (const item of pending) {
        try {
          if (item.resume.photoPath) {
            await this.photos.remove(item.resume.photoPath);
          }
          await this.prisma.resume.deleteMany({
            where: {
              id: item.resumeId,
              deletedAt: { not: null },
              deletion: { deleteAfter: { lte: now } },
            },
          });
        } catch (error) {
          this.logger.error(`Не удалось окончательно удалить резюме ${item.resumeId}`, error);
        }
      }
    } catch (error) {
      this.logger.error('Не удалось прочитать очередь удаления резюме', error);
    } finally {
      this.running = false;
    }
  }
}
