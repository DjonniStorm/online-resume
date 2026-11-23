import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import type { Prisma } from '../../generated/prisma/client';
import { TemplateStatus } from '../../generated/prisma/enums';
import { TemplateListQueryDto } from './dto/template-list-query.dto';

const templateInclude = {
  theme: true,
  sections: { orderBy: [{ region: 'asc' }, { sortOrder: 'asc' }] },
  fields: { orderBy: { field: 'asc' } },
} satisfies Prisma.ResumeTemplateInclude;

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({ page, limit, search }: TemplateListQueryDto) {
    const term = search?.trim();
    const where: Prisma.ResumeTemplateWhereInput = {
      status: TemplateStatus.ACTIVE,
      ...(term && {
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
        ],
      }),
    };
    return this.prisma.$transaction(async (transaction) => {
      const total = await transaction.resumeTemplate.count({ where });
      const currentPage = Math.min(page, Math.max(1, Math.ceil(total / limit)));
      const items = await transaction.resumeTemplate.findMany({
        where,
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        skip: (currentPage - 1) * limit,
        take: limit,
        include: templateInclude,
      });
      return { items, total, page: currentPage, limit };
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
