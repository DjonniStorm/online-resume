import { randomBytes } from 'node:crypto';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import type { Prisma } from '../../generated/prisma/client';
import { ResumeSectionType, TemplateFieldType, TemplateStatus } from '../../generated/prisma/enums';
import { resumeDeleteAfter, resumeLinkExpiresAt } from './common/deletion';
import type { UploadedPhoto } from './common/photo';
import type { ChangeResumeTemplateDto } from './dto/change-resume-template.dto';
import { CreateResumeDto } from './dto/create-resume.dto';
import { ResumeListQueryDto } from './dto/resume-list-query.dto';
import type { UpdateResumeDto } from './dto/update-resume.dto';
import { ResumePhotoStorageService } from './resume-photo-storage.service';
import { ResumeViewsService } from './resume-views.service';

const resumeDetailInclude = {
  deletion: { select: { scheduledFor: true } },
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

const resumeSummarySelect = {
  id: true,
  title: true,
  firstName: true,
  lastName: true,
  headline: true,
  isPublished: true,
  unpublishAt: true,
  deletion: { select: { scheduledFor: true } },
  createdAt: true,
  updatedAt: true,
  template: {
    select: {
      id: true,
      slug: true,
      name: true,
      layout: true,
      theme: {
        select: {
          primaryColor: true,
          pageColor: true,
          headerColor: true,
          sidebarColor: true,
        },
      },
    },
  },
} satisfies Prisma.ResumeSelect;

@Injectable()
export class ResumesService {
  private readonly logger = new Logger(ResumesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly photos: ResumePhotoStorageService,
    private readonly views: ResumeViewsService,
  ) {}

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
    const result = await this.prisma.$transaction(async (transaction) => {
      const total = await transaction.resume.count({ where });
      const currentPage = Math.min(page, Math.max(1, Math.ceil(total / limit)));
      const items = await transaction.resume.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        skip: (currentPage - 1) * limit,
        take: limit,
        select: resumeSummarySelect,
      });
      return { items, total, page: currentPage, limit };
    });
    const counts = await this.views.countsByResume(result.items.map((resume) => resume.id));
    return {
      ...result,
      items: result.items.map((resume) => ({
        ...resume,
        deletionScheduledAt: resume.deletion?.scheduledFor ?? null,
        viewsLast7Days: counts.get(resume.id) ?? 0,
      })),
    };
  }

  async overview(ownerId: string, resumeId?: string) {
    const where: Prisma.ResumeWhereInput = { ownerId, deletedAt: null };
    const selectedResume = resumeId
      ? await this.prisma.resume.findFirst({
          where: { ...where, id: resumeId },
          select: { id: true, title: true },
        })
      : null;
    if (resumeId && !selectedResume) {
      throw new NotFoundException('Резюме не найдено');
    }
    const [[total, publishedCount, latestResume], viewSummary] = await Promise.all([
      this.prisma.$transaction([
        this.prisma.resume.count({ where }),
        this.prisma.resume.count({ where: { ...where, isPublished: true } }),
        this.prisma.resume.findFirst({
          where,
          orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
          select: resumeSummarySelect,
        }),
      ]),
      this.views.summary(ownerId, resumeId),
    ]);
    const counts = await this.views.countsByResume(latestResume ? [latestResume.id] : []);
    const [unpublishing, deleting] = await Promise.all([
      this.prisma.resume.findMany({
        where: { ownerId, deletedAt: null, isPublished: true, unpublishAt: { gt: new Date() } },
        select: { id: true, title: true, unpublishAt: true },
        orderBy: { unpublishAt: 'asc' },
        take: 5,
      }),
      this.prisma.resumeDeletion.findMany({
        where: {
          scheduledFor: { gt: new Date() },
          resume: { ownerId, deletedAt: null, isPublished: true },
        },
        select: { scheduledFor: true, resume: { select: { id: true, title: true } } },
        orderBy: { scheduledFor: 'asc' },
        take: 5,
      }),
    ]);
    const scheduledLinks = [
      ...unpublishing
        .filter((item) => item.unpublishAt)
        .map((item) => ({
          id: item.id,
          title: item.title,
          kind: 'unpublish' as const,
          scheduledFor: item.unpublishAt!,
        })),
      ...deleting
        .filter((item) => item.scheduledFor)
        .map((item) => ({
          id: item.resume.id,
          title: item.resume.title,
          kind: 'delete' as const,
          scheduledFor: item.scheduledFor!,
        })),
    ]
      .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime())
      .filter((item, index, all) => all.findIndex((other) => other.id === item.id) === index)
      .slice(0, 5);
    return {
      total,
      publishedCount,
      latestResume: latestResume
        ? {
            ...latestResume,
            deletionScheduledAt: latestResume.deletion?.scheduledFor ?? null,
            viewsLast7Days: counts.get(latestResume.id) ?? 0,
          }
        : null,
      selectedResume,
      scheduledLinks,
      ...viewSummary,
    };
  }

  async findOne(ownerId: string, id: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id, ownerId, deletedAt: null },
      include: resumeDetailInclude,
    });
    if (!resume) {
      throw new NotFoundException('Резюме не найдено');
    }
    return { ...resume, deletionScheduledAt: resume.deletion?.scheduledFor ?? null };
  }

  async getPhoto(ownerId: string, id: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id, ownerId, deletedAt: null },
      select: { photoPath: true },
    });
    if (!resume) {
      throw new NotFoundException('Резюме не найдено');
    }
    return this.photos.read(resume.photoPath);
  }

  async getPublicPhoto(slug: string) {
    const resume = await this.prisma.resume.findFirst({
      where: this.publicWhere(slug),
      select: { photoPath: true },
    });
    if (!resume) {
      throw new NotFoundException('Фотография не найдена');
    }
    return this.photos.read(resume.photoPath);
  }

  async uploadPhoto(ownerId: string, id: string, file: UploadedPhoto | undefined) {
    const current = await this.prisma.resume.findFirst({
      where: { id, ownerId, deletedAt: null },
      select: { photoPath: true, revision: true },
    });
    if (!current) {
      throw new NotFoundException('Резюме не найдено');
    }

    const name = await this.photos.save(file);
    try {
      const result = await this.prisma.resume.updateMany({
        where: { id, ownerId, deletedAt: null, revision: current.revision },
        data: { photoPath: name, revision: { increment: 1 } },
      });
      if (result.count !== 1) {
        throw new ConflictException('Резюме уже изменилось. Обновите страницу.');
      }
    } catch (error) {
      await this.discardPhoto(name);
      throw error;
    }

    if (current.photoPath) {
      await this.discardPhoto(current.photoPath);
    }
    return this.findOne(ownerId, id);
  }

  async removePhoto(ownerId: string, id: string) {
    const current = await this.prisma.resume.findFirst({
      where: { id, ownerId, deletedAt: null },
      select: { photoPath: true, revision: true },
    });
    if (!current) {
      throw new NotFoundException('Резюме не найдено');
    }
    if (!current.photoPath) {
      return this.findOne(ownerId, id);
    }

    const result = await this.prisma.resume.updateMany({
      where: { id, ownerId, deletedAt: null, revision: current.revision },
      data: { photoPath: null, revision: { increment: 1 } },
    });
    if (result.count !== 1) {
      throw new ConflictException('Резюме уже изменилось. Обновите страницу.');
    }
    await this.discardPhoto(current.photoPath);
    return this.findOne(ownerId, id);
  }

  private async discardPhoto(name: string): Promise<void> {
    try {
      await this.photos.remove(name);
    } catch (error) {
      this.logger.warn(`Не удалось удалить файл фотографии ${name}`, error);
    }
  }

  async findPublic(slug: string) {
    const resume = await this.prisma.resume.findFirst({
      where: this.publicWhere(slug),
      include: resumeDetailInclude,
    });
    if (!resume) {
      throw new NotFoundException('Резюме недоступно');
    }
    return {
      ...resume,
      ownerId: undefined,
      deletionScheduledAt: resume.deletion?.scheduledFor ?? null,
    };
  }

  private publicWhere(slug: string): Prisma.ResumeWhereInput {
    const now = new Date();
    return {
      publicSlug: slug,
      isPublished: true,
      deletedAt: null,
      AND: [
        { OR: [{ unpublishAt: null }, { unpublishAt: { gt: now } }] },
        { OR: [{ deletion: { is: null } }, { deletion: { is: { scheduledFor: { gt: now } } } }] },
      ],
    };
  }

  async publish(ownerId: string, id: string) {
    const current = await this.prisma.resume.findFirst({
      where: { id, ownerId, deletedAt: null },
      select: { isPublished: true, publicSlug: true },
    });
    if (!current) {
      throw new NotFoundException('Резюме не найдено');
    }
    if (!current.isPublished || !current.publicSlug) {
      await this.prisma.resume.updateMany({
        where: { id, ownerId, deletedAt: null, isPublished: false },
        data: {
          publicSlug: current.publicSlug ?? randomBytes(18).toString('base64url'),
          isPublished: true,
          publishedAt: new Date(),
        },
      });
    } else {
      await this.prisma.resume.update({ where: { id }, data: { unpublishAt: null } });
    }
    const resume = await this.prisma.resume.findFirst({
      where: { id, ownerId, deletedAt: null },
      select: { publicSlug: true },
    });
    if (!resume?.publicSlug) {
      throw new NotFoundException('Резюме не найдено');
    }
    return { publicSlug: resume.publicSlug };
  }

  async unpublish(ownerId: string, id: string): Promise<void> {
    const result = await this.prisma.resume.updateMany({
      where: { id, ownerId, deletedAt: null },
      data: { isPublished: false, publishedAt: null, unpublishAt: null },
    });
    if (result.count !== 1) {
      throw new NotFoundException('Резюме не найдено');
    }
  }

  async scheduleUnpublish(ownerId: string, id: string) {
    const current = await this.prisma.resume.findFirst({
      where: { id, ownerId, deletedAt: null, isPublished: true },
      select: { unpublishAt: true },
    });
    if (!current) throw new NotFoundException('Опубликованное резюме не найдено');
    if (current.unpublishAt) return { scheduledFor: current.unpublishAt };
    const unpublishAt = resumeLinkExpiresAt();
    const result = await this.prisma.resume.updateMany({
      where: { id, ownerId, deletedAt: null, isPublished: true },
      data: { unpublishAt },
    });
    if (result.count !== 1) throw new NotFoundException('Опубликованное резюме не найдено');
    return { scheduledFor: unpublishAt };
  }

  async cancelUnpublish(ownerId: string, id: string): Promise<void> {
    const result = await this.prisma.resume.updateMany({
      where: { id, ownerId, deletedAt: null, unpublishAt: { gt: new Date() } },
      data: { unpublishAt: null },
    });
    if (result.count !== 1) throw new NotFoundException('Запланированное снятие не найдено');
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
    const now = new Date();
    const result = await this.prisma.$transaction(async (transaction) => {
      const resume = await transaction.resume.findFirst({
        where: { id, ownerId, deletedAt: null },
        select: { isPublished: true },
      });
      if (!resume) {
        return false;
      }
      const updated = await transaction.resume.updateMany({
        where: { id, ownerId, deletedAt: null },
        data: {
          deletedAt: now,
          isPublished: false,
          publishedAt: null,
          publicSlug: null,
          unpublishAt: null,
        },
      });
      if (updated.count !== 1) {
        return false;
      }
      await transaction.resumeDeletion.upsert({
        where: { resumeId: id },
        create: {
          resumeId: id,
          deleteAfter: resumeDeleteAfter(now),
          wasPublished: resume.isPublished,
        },
        update: {
          scheduledFor: null,
          deleteAfter: resumeDeleteAfter(now),
          wasPublished: resume.isPublished,
        },
      });
      return true;
    });
    if (!result) {
      throw new NotFoundException('Резюме не найдено');
    }
  }

  async scheduleRemove(ownerId: string, id: string) {
    const scheduledFor = resumeLinkExpiresAt();
    const result = await this.prisma.$transaction(async (transaction) => {
      const resume = await transaction.resume.findFirst({
        where: { id, ownerId, deletedAt: null },
        select: { isPublished: true, deletion: { select: { scheduledFor: true } } },
      });
      if (!resume) return false;
      if (resume.deletion?.scheduledFor) return resume.deletion.scheduledFor;
      await transaction.resumeDeletion.upsert({
        where: { resumeId: id },
        create: {
          resumeId: id,
          scheduledFor,
          deleteAfter: resumeDeleteAfter(scheduledFor),
          wasPublished: resume.isPublished,
        },
        update: { scheduledFor, deleteAfter: resumeDeleteAfter(scheduledFor) },
      });
      return scheduledFor;
    });
    if (!result) throw new NotFoundException('Резюме не найдено');
    return { scheduledFor: result };
  }

  async cancelRemove(ownerId: string, id: string): Promise<void> {
    const result = await this.prisma.resumeDeletion.deleteMany({
      where: {
        resumeId: id,
        scheduledFor: { gt: new Date() },
        resume: { ownerId, deletedAt: null },
      },
    });
    if (result.count !== 1) throw new NotFoundException('Запланированное удаление не найдено');
  }

  async deletionNotices(ownerId: string) {
    const items = await this.prisma.resumeDeletion.findMany({
      where: {
        wasPublished: true,
        noticeDismissedAt: null,
        deleteAfter: { gt: new Date() },
        resume: { ownerId, deletedAt: { not: null } },
      },
      select: { resumeId: true, deleteAfter: true, resume: { select: { title: true } } },
      orderBy: { deleteAfter: 'asc' },
    });
    return items.map((item) => ({
      resumeId: item.resumeId,
      title: item.resume.title,
      deleteAfter: item.deleteAfter,
    }));
  }

  async dismissDeletionNotices(ownerId: string): Promise<void> {
    await this.prisma.resumeDeletion.updateMany({
      where: {
        wasPublished: true,
        noticeDismissedAt: null,
        resume: { ownerId, deletedAt: { not: null } },
      },
      data: { noticeDismissedAt: new Date() },
    });
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
