import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from './generated/prisma/client';
import {
  ResumeSectionType,
  TemplateContinuationHeader,
  TemplateFieldType,
  TemplateLayout,
  TemplatePhotoPlacement,
  TemplatePhotoShape,
  TemplateRegion,
  TemplateSectionLayout,
  TemplateSpacing,
  TemplateStatus,
} from './generated/prisma/enums';
import { additionalTemplates } from './seed/additional-templates';

loadEnvironment();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to seed the database');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

function loadEnvironment() {
  const envPath = resolve(__dirname, '../../../.env');
  if (!existsSync(envPath)) {
    return;
  }

  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separator = trimmed.indexOf('=');
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

const fields = [
  TemplateFieldType.FIRST_NAME,
  TemplateFieldType.LAST_NAME,
  TemplateFieldType.HEADLINE,
  TemplateFieldType.EMAIL,
  TemplateFieldType.PHONE,
  TemplateFieldType.LOCATION,
  TemplateFieldType.GITHUB_URL,
  TemplateFieldType.TELEGRAM_HANDLE,
  TemplateFieldType.WEBSITE_URL,
];

const templates = [
  {
    slug: 'clear-focus',
    name: 'Clear Focus',
    description: 'Спокойный одноколоночный шаблон для последовательного рассказа об опыте.',
    layout: TemplateLayout.SINGLE_COLUMN,
    pageWidthMm: 210,
    pageHeightMm: 297,
    sidebarWidthPercent: null,
    photoPlacement: TemplatePhotoPlacement.NONE,
    photoShape: TemplatePhotoShape.CIRCLE,
    continuationHeader: TemplateContinuationHeader.COMPACT,
    theme: {
      titleFontFamily: 'Georgia',
      bodyFontFamily: 'Arial',
      titleSizePt: 29,
      sectionTitleSizePt: 10,
      bodySizePt: 9.5,
      lineHeight: 1.3,
      spacing: TemplateSpacing.RELAXED,
      primaryColor: '#24313B',
      secondaryColor: '#A35E40',
      textColor: '#2D3337',
      pageColor: '#FFFEFB',
      headerColor: '#FFFEFB',
      sidebarColor: null,
    },
    sections: [
      {
        type: ResumeSectionType.PROFILE,
        region: TemplateRegion.HEADER,
        sortOrder: 0,
        itemLayout: TemplateSectionLayout.STANDARD,
      },
      {
        type: ResumeSectionType.CONTACTS,
        region: TemplateRegion.HEADER,
        sortOrder: 1,
        itemLayout: TemplateSectionLayout.COMPACT,
        showHeading: false,
      },
      {
        type: ResumeSectionType.ABOUT,
        region: TemplateRegion.MAIN,
        sortOrder: 0,
        itemLayout: TemplateSectionLayout.STANDARD,
      },
      {
        type: ResumeSectionType.EXPERIENCE,
        region: TemplateRegion.MAIN,
        sortOrder: 1,
        itemLayout: TemplateSectionLayout.TIMELINE,
      },
      {
        type: ResumeSectionType.EDUCATION,
        region: TemplateRegion.MAIN,
        sortOrder: 2,
        itemLayout: TemplateSectionLayout.COMPACT,
      },
      {
        type: ResumeSectionType.SKILLS,
        region: TemplateRegion.MAIN,
        sortOrder: 3,
        itemLayout: TemplateSectionLayout.BARS,
      },
      {
        type: ResumeSectionType.LANGUAGES,
        region: TemplateRegion.MAIN,
        sortOrder: 4,
        itemLayout: TemplateSectionLayout.TAGS,
      },
      {
        type: ResumeSectionType.PROJECTS,
        region: TemplateRegion.MAIN,
        sortOrder: 5,
        itemLayout: TemplateSectionLayout.COMPACT,
      },
      {
        type: ResumeSectionType.CERTIFICATES,
        region: TemplateRegion.MAIN,
        sortOrder: 6,
        itemLayout: TemplateSectionLayout.COMPACT,
      },
    ],
  },
  {
    slug: 'left-rail',
    name: 'Left Rail',
    description: 'Шаблон с левой колонкой для контактов, навыков и коротких фактов.',
    layout: TemplateLayout.SIDEBAR_LEFT,
    pageWidthMm: 210,
    pageHeightMm: 297,
    sidebarWidthPercent: 31,
    photoPlacement: TemplatePhotoPlacement.SIDEBAR_TOP,
    photoShape: TemplatePhotoShape.ROUNDED_RECTANGLE,
    continuationHeader: TemplateContinuationHeader.COMPACT,
    theme: {
      titleFontFamily: 'Arial',
      bodyFontFamily: 'Arial',
      titleSizePt: 27,
      sectionTitleSizePt: 10,
      bodySizePt: 9,
      lineHeight: 1.32,
      spacing: TemplateSpacing.REGULAR,
      primaryColor: '#175A68',
      secondaryColor: '#C6E0DD',
      textColor: '#26353B',
      pageColor: '#FFFFFF',
      headerColor: '#FFFFFF',
      sidebarColor: '#174453',
    },
    sections: [
      {
        type: ResumeSectionType.PROFILE,
        region: TemplateRegion.HEADER,
        sortOrder: 0,
        itemLayout: TemplateSectionLayout.STANDARD,
      },
      {
        type: ResumeSectionType.CONTACTS,
        region: TemplateRegion.SIDEBAR,
        sortOrder: 0,
        itemLayout: TemplateSectionLayout.COMPACT,
      },
      {
        type: ResumeSectionType.SKILLS,
        region: TemplateRegion.SIDEBAR,
        sortOrder: 1,
        itemLayout: TemplateSectionLayout.BARS,
      },
      {
        type: ResumeSectionType.LANGUAGES,
        region: TemplateRegion.SIDEBAR,
        sortOrder: 2,
        itemLayout: TemplateSectionLayout.TAGS,
      },
      {
        type: ResumeSectionType.CERTIFICATES,
        region: TemplateRegion.SIDEBAR,
        sortOrder: 3,
        itemLayout: TemplateSectionLayout.COMPACT,
      },
      {
        type: ResumeSectionType.ABOUT,
        region: TemplateRegion.MAIN,
        sortOrder: 0,
        itemLayout: TemplateSectionLayout.STANDARD,
      },
      {
        type: ResumeSectionType.EXPERIENCE,
        region: TemplateRegion.MAIN,
        sortOrder: 1,
        itemLayout: TemplateSectionLayout.TIMELINE,
      },
      {
        type: ResumeSectionType.EDUCATION,
        region: TemplateRegion.MAIN,
        sortOrder: 2,
        itemLayout: TemplateSectionLayout.COMPACT,
      },
      {
        type: ResumeSectionType.PROJECTS,
        region: TemplateRegion.MAIN,
        sortOrder: 3,
        itemLayout: TemplateSectionLayout.COMPACT,
      },
    ],
  },
  {
    slug: 'wide-header',
    name: 'Wide Header',
    description: 'Выразительная шапка и плотная основная область для проектного профиля.',
    layout: TemplateLayout.WIDE_HEADER,
    pageWidthMm: 210,
    pageHeightMm: 297,
    sidebarWidthPercent: 29,
    photoPlacement: TemplatePhotoPlacement.HEADER_END,
    photoShape: TemplatePhotoShape.CIRCLE,
    continuationHeader: TemplateContinuationHeader.FULL,
    theme: {
      titleFontFamily: 'Arial',
      bodyFontFamily: 'Arial',
      titleSizePt: 26,
      sectionTitleSizePt: 10,
      bodySizePt: 9,
      lineHeight: 1.2,
      spacing: TemplateSpacing.COMPACT,
      primaryColor: '#233B41',
      secondaryColor: '#C6A275',
      textColor: '#2B3439',
      pageColor: '#FFFFFF',
      headerColor: '#233B41',
      sidebarColor: '#F0F2ED',
    },
    sections: [
      {
        type: ResumeSectionType.PROFILE,
        region: TemplateRegion.HEADER,
        sortOrder: 0,
        itemLayout: TemplateSectionLayout.STANDARD,
      },
      {
        type: ResumeSectionType.CONTACTS,
        region: TemplateRegion.HEADER,
        sortOrder: 1,
        itemLayout: TemplateSectionLayout.COMPACT,
        showHeading: false,
      },
      {
        type: ResumeSectionType.SKILLS,
        region: TemplateRegion.SIDEBAR,
        sortOrder: 0,
        itemLayout: TemplateSectionLayout.BARS,
      },
      {
        type: ResumeSectionType.LANGUAGES,
        region: TemplateRegion.SIDEBAR,
        sortOrder: 1,
        itemLayout: TemplateSectionLayout.TAGS,
      },
      {
        type: ResumeSectionType.CERTIFICATES,
        region: TemplateRegion.SIDEBAR,
        sortOrder: 2,
        itemLayout: TemplateSectionLayout.COMPACT,
      },
      {
        type: ResumeSectionType.ABOUT,
        region: TemplateRegion.MAIN,
        sortOrder: 0,
        itemLayout: TemplateSectionLayout.STANDARD,
      },
      {
        type: ResumeSectionType.EXPERIENCE,
        region: TemplateRegion.MAIN,
        sortOrder: 1,
        itemLayout: TemplateSectionLayout.TIMELINE,
      },
      {
        type: ResumeSectionType.EDUCATION,
        region: TemplateRegion.MAIN,
        sortOrder: 2,
        itemLayout: TemplateSectionLayout.COMPACT,
      },
      {
        type: ResumeSectionType.PROJECTS,
        region: TemplateRegion.MAIN,
        sortOrder: 3,
        itemLayout: TemplateSectionLayout.COMPACT,
      },
    ],
  },
] as const;

const allTemplates = [...templates, ...additionalTemplates] as const;

async function seedTemplate(template: (typeof allTemplates)[number]) {
  await prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw`SELECT pg_advisory_xact_lock(42, hashtext(${template.slug}))::text`;
    const existing = await transaction.resumeTemplate.findUnique({
      where: { slug: template.slug },
      include: { sections: true, fields: true },
    });
    const savedTemplate = await transaction.resumeTemplate.upsert({
      where: { slug: template.slug },
      create: {
        slug: template.slug,
        name: template.name,
        description: template.description,
        status: TemplateStatus.ACTIVE,
        layout: template.layout,
        pageWidthMm: template.pageWidthMm,
        pageHeightMm: template.pageHeightMm,
        sidebarWidthPercent: template.sidebarWidthPercent,
        photoPlacement: template.photoPlacement,
        photoShape: template.photoShape,
        continuationHeader: template.continuationHeader,
        publishedAt: new Date(),
      },
      update: {
        name: template.name,
        description: template.description,
        layout: template.layout,
        pageWidthMm: template.pageWidthMm,
        pageHeightMm: template.pageHeightMm,
        sidebarWidthPercent: template.sidebarWidthPercent,
        photoPlacement: template.photoPlacement,
        photoShape: template.photoShape,
        continuationHeader: template.continuationHeader,
        updatedAt: new Date(),
      },
    });

    await transaction.templateTheme.upsert({
      where: { templateId: savedTemplate.id },
      create: { templateId: savedTemplate.id, ...template.theme },
      update: template.theme,
    });

    const sectionsChanged =
      !existing ||
      existing.sections.length !== template.sections.length ||
      template.sections.some((section) => {
        const current = existing.sections.find((item) => item.type === section.type);
        return (
          !current ||
          current.region !== section.region ||
          current.sortOrder !== section.sortOrder ||
          current.itemLayout !== section.itemLayout ||
          !current.canReorder ||
          current.showHeading !== ('showHeading' in section ? section.showHeading : true)
        );
      });

    if (sectionsChanged) {
      await transaction.templateSection.deleteMany({ where: { templateId: savedTemplate.id } });
      await transaction.templateSection.createMany({
        data: template.sections.map((section) => ({
          templateId: savedTemplate.id,
          ...section,
          canReorder: true,
          showHeading: 'showHeading' in section ? section.showHeading : true,
        })),
      });
    }

    const fieldsChanged =
      !existing ||
      existing.fields.length !== fields.length ||
      fields.some((field) => {
        const current = existing.fields.find((item) => item.field === field);
        return (
          !current ||
          current.isRequired !==
            (field === TemplateFieldType.FIRST_NAME || field === TemplateFieldType.LAST_NAME)
        );
      });

    if (fieldsChanged) {
      await transaction.templateFieldRule.deleteMany({ where: { templateId: savedTemplate.id } });
      await transaction.templateFieldRule.createMany({
        data: fields.map((field) => ({
          templateId: savedTemplate.id,
          field,
          isRequired:
            field === TemplateFieldType.FIRST_NAME || field === TemplateFieldType.LAST_NAME,
        })),
      });
    }
  });

  console.info(`Seeded template: ${template.slug}`);
}

async function main() {
  for (const template of allTemplates) {
    await seedTemplate(template);
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
