import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { RESUME_CLEANUP_INTERVAL_MS } from './common/deletion';
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
      const pending = await this.prisma.resumeDeletion.findMany({
        where: { deleteAfter: { lte: now } },
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
