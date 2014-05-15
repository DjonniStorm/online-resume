import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import type { Prisma } from '../../generated/prisma/client';
import { TemplateStatus } from '../../generated/prisma/enums';
import { CreateResumeDto } from './dto/create-resume.dto';
import { ResumeListQueryDto } from './dto/resume-list-query.dto';

const resumeDetailInclude = {
  template: {
    include: {
      theme: true,
      sections: { orderBy: [{ region: 'asc' }, { sortOrder: 'asc' }] },
      fields: { orderBy: { field: 'asc' } },
    },
  },
  sections: { orderBy: { sortOrder: 'asc' } },
  experiences: { orderBy: { sortOrder: 'asc' } },
  educations: { orderBy: { sortOrder: 'asc' } },
  skills: { orderBy: { sortOrder: 'asc' } },
  languages: { orderBy: { sortOrder: 'asc' } },
  projects: { orderBy: { sortOrder: 'asc' } },
  certificates: { orderBy: { sortOrder: 'asc' } },
} satisfies Prisma.ResumeInclude;

@Injectable()
export class ResumesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, input: CreateResumeDto) {
    const template = await this.prisma.resumeTemplate.findFirst({
      where: {
        slug: input.templateSlug,
        status: TemplateStatus.ACTIVE,
      },
      include: { sections: true },
    });
    if (!template) {
      throw new NotFoundException('Активный шаблон не найден');
    }

    return this.prisma.$transaction(async (transaction) => {
      const resume = await transaction.resume.create({
        data: {
          ownerId,
          templateId: template.id,
          title: input.title,
          firstName: input.firstName,
          lastName: input.lastName,
          headline: input.headline,
          email: input.email,
          phone: input.phone,
          location: input.location,
          githubUrl: input.githubUrl,
          telegramHandle: input.telegramHandle,
          websiteUrl: input.websiteUrl,
          about: input.about,
          sections: {
            create: template.sections.map((section) => ({
              type: section.type,
              sortOrder: section.sortOrder,
              isVisible: true,
            })),
          },
        },
      });

      return transaction.resume.findUniqueOrThrow({
        where: { id: resume.id },
        include: resumeDetailInclude,
      });
    });
  }

  async findAll(ownerId: string, { page, limit, search }: ResumeListQueryDto) {
    const term = search?.trim();
    const where: Prisma.ResumeWhereInput = {
      ownerId,
      deletedAt: null,
      ...(term
        ? {
            OR: [
              { title: { contains: term, mode: 'insensitive' } },
              { firstName: { contains: term, mode: 'insensitive' } },
              { lastName: { contains: term, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [total, items] = await this.prisma.$transaction([
      this.prisma.resume.count({ where }),
      this.prisma.resume.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          updatedAt: true,
          template: {
            select: {
              id: true,
              slug: true,
              name: true,
            },
          },
        },
      }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(ownerId: string, id: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id, ownerId, deletedAt: null },
      include: resumeDetailInclude,
    });
    if (!resume) {
      throw new NotFoundException('Резюме не найдено');
    }
    return resume;
  }

  async remove(ownerId: string, id: string): Promise<void> {
    const result = await this.prisma.resume.updateMany({
      where: { id, ownerId, deletedAt: null },
      data: {
        deletedAt: new Date(),
        isPublished: false,
        publishedAt: null,
        publicSlug: null,
      },
    });
    if (result.count !== 1) {
      throw new NotFoundException('Резюме не найдено');
    }
  }
}
