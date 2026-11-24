import type { Page } from 'playwright/test';

import type {
  CreateResumeDto,
  ResumeSummaryDto,
} from '../../../src/shared/api/generated/types.gen';
import { editorResume, session } from './editor';
import { templates } from './templates';

const template = templates.find(({ slug }) => slug === 'clear-focus');
if (!template) {
  throw new Error('Для теста создания нужен шаблон Clear Focus.');
}

const createdResume: ResumeSummaryDto = {
  id: 'new-resume',
  title: 'Резюме разработчика',
  firstName: 'Анна',
  lastName: 'Петрова',
  headline: 'Frontend-разработчик',
  isPublished: false,
  unpublishAt: null,
  deletionScheduledAt: null,
  viewsLast7Days: 0,
  template: {
    id: template.id,
    slug: template.slug,
    name: template.name,
    layout: template.layout,
    theme: null,
  },
  createdAt: editorResume.createdAt,
  updatedAt: editorResume.updatedAt,
};

type CreationOptions = { authenticated?: boolean; createStatuses?: number[] };

export async function openTemplateForCreation(page: Page, options: CreationOptions = {}) {
  const requests: CreateResumeDto[] = [];
  const statuses = options.createStatuses ?? [201];
  let created = false;

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();

    if (path === '/api/auth/refresh') {
      await route.fulfill(options.authenticated === false ? { status: 204 } : { json: session });
      return;
    }
    if (path === '/api/templates') {
      await route.fulfill({
        json: { items: templates, total: templates.length, page: 1, limit: 3 },
      });
      return;
    }
    if (path === '/api/resumes/deletions/notices') {
      await route.fulfill({ json: [] });
      return;
    }
    if (path === '/api/resumes' && method === 'POST') {
      requests.push(route.request().postDataJSON() as CreateResumeDto);
      const status = statuses[Math.min(requests.length - 1, statuses.length - 1)];
      if (status === 201) {
        created = true;
        await route.fulfill({ status, json: { ...editorResume, id: createdResume.id } });
        return;
      }
      await route.fulfill({ status, json: { message: 'Не удалось создать резюме' } });
      return;
    }
    if (path === '/api/resumes' && method === 'GET') {
      const items = created ? [createdResume] : [];
      await route.fulfill({ json: { items, total: items.length, page: 1, limit: 10 } });
      return;
    }
    throw new Error(`Неожиданный запрос API: ${method} ${path}`);
  });

  await page.goto('/templates');
  await page.getByRole('button', { name: 'Посмотреть шаблон Clear Focus' }).click();
  return requests;
}
