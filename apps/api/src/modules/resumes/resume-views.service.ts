import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

const dayMs = 24 * 60 * 60 * 1000;
const chartDays = 7;

@Injectable()
export class ResumeViewsService {
  private readonly logger = new Logger(ResumeViewsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(resumeId: string, visitorKey: string): Promise<void> {
    try {
      const recent = await this.prisma.resumeView.findFirst({
        where: {
          resumeId,
          visitorKey,
          viewedAt: { gte: new Date(Date.now() - dayMs) },
        },
        select: { id: true },
      });
      if (!recent) {
        await this.prisma.resumeView.create({ data: { resumeId, visitorKey } });
      }
    } catch (error) {
      this.logger.warn(`Не удалось записать просмотр резюме ${resumeId}`, error);
    }
  }

  async summary(ownerId: string) {
    const now = new Date();
    const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const start = new Date(today - (chartDays - 1) * dayMs);
    const [total, rows] = await Promise.all([
      this.prisma.resumeView.count({
        where: { resume: { ownerId, deletedAt: null } },
      }),
      this.prisma.$queryRaw<Array<{ day: string; count: bigint }>>`
        SELECT to_char(v."viewedAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day,
               COUNT(*) AS count
        FROM "ResumeView" v
        JOIN "Resume" r ON r."id" = v."resumeId"
        WHERE r."ownerId" = ${ownerId}
          AND r."deletedAt" IS NULL
          AND v."viewedAt" >= ${start}
        GROUP BY day
        ORDER BY day
      `,
    ]);
    const counts = new Map(rows.map((row) => [row.day, Number(row.count)]));
    const dailyViews = Array.from({ length: chartDays }, (_, index) => {
      const date = new Date(today - (chartDays - 1 - index) * dayMs).toISOString().slice(0, 10);
      return { date, count: counts.get(date) ?? 0 };
    });
    return {
      viewsTotal: total,
      viewsLast7Days: dailyViews.reduce((sum, day) => sum + day.count, 0),
      dailyViews,
    };
  }
}
