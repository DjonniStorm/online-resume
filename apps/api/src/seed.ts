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
      titleFontFamily: 'Inter',
      bodyFontFamily: 'Inter',
      titleSizePt: 24,
      sectionTitleSizePt: 11,
      bodySizePt: 9.5,
      lineHeight: 1.3,
      spacing: TemplateSpacing.RELAXED,
      primaryColor: '#17324D',
      secondaryColor: '#C77B5B',
      textColor: '#24313A',
      pageColor: '#FFFDF9',
      headerColor: '#FFFDF9',
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
      titleFontFamily: 'Manrope',
      bodyFontFamily: 'Inter',
      titleSizePt: 22,
      sectionTitleSizePt: 10,
      bodySizePt: 9,
      lineHeight: 1.25,
      spacing: TemplateSpacing.REGULAR,
      primaryColor: '#2E6FAE',
      secondaryColor: '#DBE8F4',
      textColor: '#1D2B3A',
      pageColor: '#FFFFFF',
      headerColor: '#FFFFFF',
      sidebarColor: '#E8F1FB',
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
      titleFontFamily: 'Manrope',
      bodyFontFamily: 'Inter',
      titleSizePt: 26,
      sectionTitleSizePt: 11,
      bodySizePt: 9,
      lineHeight: 1.2,
      spacing: TemplateSpacing.COMPACT,
      primaryColor: '#223B52',
      secondaryColor: '#6F8240',
      textColor: '#27313A',
      pageColor: '#FFFFFF',
      headerColor: '#223B52',
      sidebarColor: '#F4F5EE',
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

async function seedTemplate(template: (typeof templates)[number]) {
  await prisma.$transaction(async (transaction) => {
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
        status: TemplateStatus.ACTIVE,
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

    await transaction.templateSection.deleteMany({ where: { templateId: savedTemplate.id } });
    await transaction.templateFieldRule.deleteMany({ where: { templateId: savedTemplate.id } });

    await transaction.templateSection.createMany({
      data: template.sections.map((section) => ({
        templateId: savedTemplate.id,
        ...section,
        canReorder: true,
        showHeading: true,
      })),
    });

    await transaction.templateFieldRule.createMany({
      data: fields.map((field) => ({
        templateId: savedTemplate.id,
        field,
        isRequired: field === TemplateFieldType.FIRST_NAME || field === TemplateFieldType.LAST_NAME,
      })),
    });
  });

  console.info(`Seeded template: ${template.slug}`);
}

async function main() {
  for (const template of templates) {
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
