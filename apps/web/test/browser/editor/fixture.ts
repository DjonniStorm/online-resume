import { type Page, expect } from 'playwright/test';

import type {
  ChangeResumeTemplateDto,
  ResumeDto,
  ResumeSectionDto,
  TemplateDto,
  TemplateSectionDto,
  UpdateResumeDto,
} from '../../../src/shared/api/generated/types.gen';
import { editorResume, editorResumeId, session } from '../fixtures/editor';

type SectionType = TemplateSectionDto['type'];

function templateSection(
  type: SectionType,
  region: TemplateSectionDto['region'],
  order: number,
): TemplateSectionDto {
  return {
    id: `template-${type.toLowerCase()}`,
    type,
    region,
    sortOrder: order,
    itemLayout: 'STANDARD',
    canReorder: type !== 'PROFILE' && type !== 'CONTACTS',
    showHeading: type !== 'PROFILE' && type !== 'CONTACTS',
    headingText: null,
    accentColor: null,
  };
}

const sections: TemplateSectionDto[] = [
  templateSection('PROFILE', 'HEADER', 0),
  templateSection('CONTACTS', 'HEADER', 1),
  templateSection('ABOUT', 'MAIN', 0),
  templateSection('EXPERIENCE', 'MAIN', 1),
  templateSection('EDUCATION', 'MAIN', 2),
  templateSection('PROJECTS', 'MAIN', 3),
  templateSection('SKILLS', 'SIDEBAR', 0),
  templateSection('LANGUAGES', 'SIDEBAR', 1),
  templateSection('CERTIFICATES', 'SIDEBAR', 2),
];

const editorFields: Array<TemplateDto['fields'][number]['field']> = [
  'FIRST_NAME',
  'LAST_NAME',
  'HEADLINE',
  'EMAIL',
  'PHONE',
  'LOCATION',
  'GITHUB_URL',
  'TELEGRAM_HANDLE',
  'WEBSITE_URL',
];

export const editorTemplate: TemplateDto = {
  ...editorResume.template,
  id: 'editor-template',
  slug: 'editor-template',
  name: 'Основной шаблон',
  layout: 'SIDEBAR_LEFT',
  sidebarWidthPercent: 30,
  sections,
  fields: editorFields.map((field) => ({ field, isRequired: false })),
};

export const alternativeTemplate: TemplateDto = {
  ...editorTemplate,
  id: 'alternative-template',
  slug: 'alternative-template',
  name: 'Другой шаблон',
  layout: 'WIDE_HEADER',
  sections: sections.map((section) => ({
    ...section,
    region: section.region === 'SIDEBAR' ? 'MAIN' : section.region,
  })),
};

const resumeSections: ResumeSectionDto[] = sections.map((section, index) => ({
  id: `resume-${section.type.toLowerCase()}`,
  type: section.type,
  sortOrder: index,
  isVisible: true,
}));

export const richResume: ResumeDto = {
  ...editorResume,
  template: editorTemplate,
  about: 'Исходный текст о себе',
  sections: resumeSections,
};

type EditorHarnessOptions = {
  initialResume?: ResumeDto;
  updateStatus?: number;
  templateStatus?: number;
};

export async function openEditor(page: Page, options: EditorHarnessOptions = {}) {
  let saved: ResumeDto = structuredClone(options.initialResume ?? richResume);
  const updates: UpdateResumeDto[] = [];
  const templateChanges: ChangeResumeTemplateDto[] = [];
  let updateStatus = options.updateStatus ?? 200;
  let templateStatus = options.templateStatus ?? 200;

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    if (url.pathname === '/api/auth/refresh') {
      await route.fulfill({ json: session });
      return;
    }
    if (url.pathname === '/api/resumes/deletions/notices') {
      await route.fulfill({ json: [] });
      return;
    }
    if (url.pathname === `/api/resumes/${editorResumeId}`) {
      if (method === 'GET') {
        await route.fulfill({ json: saved });
        return;
      }
      if (method === 'PATCH') {
        const input = route.request().postDataJSON() as UpdateResumeDto;
        updates.push(input);
        if (updateStatus !== 200) {
          await route.fulfill({ status: updateStatus, json: { message: 'Не удалось сохранить' } });
          return;
        }
        saved = {
          ...saved,
          title: input.title,
          firstName: input.firstName,
          lastName: input.lastName,
          headline: input.headline ?? null,
          email: input.email ?? null,
          phone: input.phone ?? null,
          location: input.location ?? null,
          githubUrl: input.githubUrl ?? null,
          telegramHandle: input.telegramHandle ?? null,
          websiteUrl: input.websiteUrl ?? null,
          about: input.about ?? null,
          sections: input.sections.map((section, index) => ({
            id: `resume-${section.type.toLowerCase()}`,
            type: section.type,
            sortOrder: index,
            isVisible: section.isVisible,
          })),
          revision: saved.revision + 1,
        };
        await route.fulfill({ json: saved });
        return;
      }
    }
    if (url.pathname === '/api/templates' && method === 'GET') {
      const search = url.searchParams.get('search')?.toLowerCase() ?? '';
      const items = [editorTemplate, alternativeTemplate].filter((template) =>
        template.name.toLowerCase().includes(search),
      );
      await route.fulfill({ json: { items, total: items.length, page: 1, limit: 3 } });
      return;
    }
    if (url.pathname === `/api/resumes/${editorResumeId}/template` && method === 'PATCH') {
      const input = route.request().postDataJSON() as ChangeResumeTemplateDto;
      templateChanges.push(input);
      if (templateStatus !== 200) {
        await route.fulfill({
          status: templateStatus,
          json: { message: 'Не удалось сменить шаблон' },
        });
        return;
      }
      saved = { ...saved, template: alternativeTemplate, revision: saved.revision + 1 };
      await route.fulfill({ json: saved });
      return;
    }
    throw new Error(`Неожиданный запрос API: ${method} ${url.pathname}`);
  });

  await page.goto(`/resumes/${editorResumeId}/edit`);
  await expect(page.getByRole('textbox', { name: 'Название резюме' })).toHaveValue(saved.title);
  return {
    updates,
    templateChanges,
    get saved() {
      return saved;
    },
    setUpdateStatus(status: number) {
      updateStatus = status;
    },
    setTemplateStatus(status: number) {
      templateStatus = status;
    },
  };
}
