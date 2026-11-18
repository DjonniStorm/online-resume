import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import type { Prisma } from '../../generated/prisma/client';
import { ResumeSectionType, TemplateFieldType, TemplateStatus } from '../../generated/prisma/enums';
import type { ChangeResumeTemplateDto } from './dto/change-resume-template.dto';
import { CreateResumeDto } from './dto/create-resume.dto';
import { ResumeListQueryDto } from './dto/resume-list-query.dto';
import type { UpdateResumeDto } from './dto/update-resume.dto';

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

  async update(ownerId: string, id: string, input: UpdateResumeDto) {
    const current = await this.prisma.resume.findFirst({
      where: { id, ownerId, deletedAt: null },
      include: {
        template: { include: { fields: true, sections: true } },
      },
    });
    if (!current) {
      throw new NotFoundException('Резюме не найдено');
    }
    if (current.revision !== input.revision) {
      throw new ConflictException(
        'Резюме уже изменилось. Обновите страницу и повторите сохранение.',
      );
    }

    validateRequiredFields(current.template.fields, input);
    const sections = normalizeSections(current.template.sections, input.sections);
    validateDateRanges(input);

    return this.prisma.$transaction(async (transaction) =>
      transaction.resume.update({
        where: { id: current.id },
        data: {
          revision: { increment: 1 },
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
            deleteMany: {},
            create: sections,
          },
          experiences: {
            deleteMany: {},
            create: input.experiences.map((item, sortOrder) => ({
              company: item.company,
              position: item.position,
              location: item.location,
              startDate: dateValue(item.startDate),
              endDate: dateValue(item.endDate),
              isCurrent: item.isCurrent,
              description: item.description,
              sortOrder,
            })),
          },
          educations: {
            deleteMany: {},
            create: input.educations.map((item, sortOrder) => ({
              institution: item.institution,
              degree: item.degree,
              fieldOfStudy: item.fieldOfStudy,
              location: item.location,
              startDate: dateValue(item.startDate),
              endDate: dateValue(item.endDate),
              description: item.description,
              sortOrder,
            })),
          },
          skills: {
            deleteMany: {},
            create: input.skills.map((item, sortOrder) => ({
              name: item.name,
              level: item.level,
              sortOrder,
            })),
          },
          languages: {
            deleteMany: {},
            create: input.languages.map((item, sortOrder) => ({
              name: item.name,
              proficiency: item.proficiency,
              sortOrder,
            })),
          },
          projects: {
            deleteMany: {},
            create: input.projects.map((item, sortOrder) => ({
              name: item.name,
              role: item.role,
              description: item.description,
              url: item.url,
              startDate: dateValue(item.startDate),
              endDate: dateValue(item.endDate),
              sortOrder,
            })),
          },
          certificates: {
            deleteMany: {},
            create: input.certificates.map((item, sortOrder) => ({
              name: item.name,
              issuer: item.issuer,
              issuedAt: dateValue(item.issuedAt),
              expiresAt: dateValue(item.expiresAt),
              credentialUrl: item.credentialUrl,
              sortOrder,
            })),
          },
        },
        include: resumeDetailInclude,
      }),
    );
  }

  async changeTemplate(ownerId: string, id: string, input: ChangeResumeTemplateDto) {
    const current = await this.prisma.resume.findFirst({
      where: { id, ownerId, deletedAt: null },
      include: { sections: true },
    });
    if (!current) {
      throw new NotFoundException('Резюме не найдено');
    }
    if (current.revision !== input.revision) {
      throw new ConflictException(
        'Резюме уже изменилось. Обновите страницу и повторите смену шаблона.',
      );
    }

    const template = await this.prisma.resumeTemplate.findFirst({
      where: { slug: input.templateSlug, status: TemplateStatus.ACTIVE },
      include: { sections: true },
    });
    if (!template) {
      throw new NotFoundException('Активный шаблон не найден');
    }
    if (current.templateId === template.id) {
      return this.findOne(ownerId, id);
    }

    const templateTypes = new Set(template.sections.map((section) => section.type));
    if (current.sections.some((section) => !templateTypes.has(section.type))) {
      throw new BadRequestException('Выбранный шаблон не поддерживает разделы этого резюме');
    }

    const currentSections = new Map(current.sections.map((section) => [section.type, section]));
    const sections = template.sections.map((templateSection) => {
      const currentSection = currentSections.get(templateSection.type);
      return {
        type: templateSection.type,
        sortOrder: currentSection?.sortOrder ?? templateSection.sortOrder,
        isVisible: currentSection?.isVisible ?? true,
      };
    });

    return this.prisma.$transaction(async (transaction) =>
      transaction.resume.update({
        where: { id: current.id },
        data: {
          templateId: template.id,
          revision: { increment: 1 },
          sections: {
            deleteMany: {},
            create: sections,
          },
        },
        include: resumeDetailInclude,
      }),
    );
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

function normalizeSections(
  templateSections: Array<{ type: ResumeSectionType; canReorder: boolean }>,
  sections: UpdateResumeDto['sections'],
) {
  const availableTypes = new Set(templateSections.map((section) => section.type));
  const usedTypes = new Set<ResumeSectionType>();

  return sections.map((section, sortOrder) => {
    if (!availableTypes.has(section.type)) {
      throw new BadRequestException('Раздел не поддерживается выбранным шаблоном');
    }
    if (usedTypes.has(section.type)) {
      throw new BadRequestException('Разделы резюме не должны повторяться');
    }
    usedTypes.add(section.type);
    return {
      type: section.type,
      sortOrder,
      isVisible: section.isVisible,
    };
  });
}

function validateRequiredFields(
  fields: Array<{ field: TemplateFieldType; isRequired: boolean }>,
  input: UpdateResumeDto,
): void {
  const values: Record<TemplateFieldType, string | undefined> = {
    [TemplateFieldType.FIRST_NAME]: input.firstName,
    [TemplateFieldType.LAST_NAME]: input.lastName,
    [TemplateFieldType.HEADLINE]: input.headline,
    [TemplateFieldType.EMAIL]: input.email,
    [TemplateFieldType.PHONE]: input.phone,
    [TemplateFieldType.LOCATION]: input.location,
    [TemplateFieldType.GITHUB_URL]: input.githubUrl,
    [TemplateFieldType.TELEGRAM_HANDLE]: input.telegramHandle,
    [TemplateFieldType.WEBSITE_URL]: input.websiteUrl,
  };

  for (const field of fields) {
    if (field.isRequired && !values[field.field]?.trim()) {
      throw new BadRequestException(`Поле ${field.field} обязательно`);
    }
  }
}

function validateDateRanges(input: UpdateResumeDto): void {
  for (const item of input.experiences) {
    validateDateRange(item.startDate, item.endDate, item.isCurrent, 'Опыт работы');
  }
  for (const item of input.educations) {
    validateDateRange(item.startDate, item.endDate, false, 'Образование');
  }
  for (const item of input.projects) {
    validateDateRange(item.startDate, item.endDate, false, 'Проект');
  }
  for (const item of input.certificates) {
    validateDateRange(item.issuedAt, item.expiresAt, false, 'Сертификат');
  }
}

function validateDateRange(
  startDate: string | undefined,
  endDate: string | undefined,
  isCurrent: boolean,
  label: string,
): void {
  if (isCurrent && endDate) {
    throw new BadRequestException(`${label}: текущая запись не может иметь дату окончания`);
  }
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new BadRequestException(`${label}: дата начала не может быть позже даты окончания`);
  }
}

function dateValue(value: string | undefined): Date | undefined {
  return value ? new Date(value) : undefined;
}
