import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import type { Prisma } from '../../generated/prisma/client';
import { TemplateStatus } from '../../generated/prisma/enums';

const templateInclude = {
  theme: true,
  sections: { orderBy: [{ region: 'asc' }, { sortOrder: 'asc' }] },
  fields: { orderBy: { field: 'asc' } },
} satisfies Prisma.ResumeTemplateInclude;

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.resumeTemplate.findMany({
      where: { status: TemplateStatus.ACTIVE },
      orderBy: { createdAt: 'asc' },
      include: templateInclude,
    });
  }

  async findOne(slug: string) {
    const template = await this.prisma.resumeTemplate.findFirst({
      where: { slug, status: TemplateStatus.ACTIVE },
      include: templateInclude,
    });
    if (!template) {
      throw new NotFoundException('Шаблон не найден');
    }
    return template;
  }
}
