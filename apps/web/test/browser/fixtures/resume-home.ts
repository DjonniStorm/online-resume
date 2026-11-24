import type { Page } from 'playwright/test';

import type {
  ResumeOverviewDto,
  ResumeSummaryDto,
} from '../../../src/shared/api/generated/types.gen';
import { editorResume, session } from './editor';

const firstId = editorResume.id;
const secondId = 'second-resume';
const dayMs = 24 * 60 * 60 * 1000;
const linkGraceDays = 3;
const retentionDays = 30;
const chartDays = 7;
const scheduledFor = new Date(Date.now() + linkGraceDays * dayMs).toISOString();
const deleteAfter = new Date(Date.now() + retentionDays * dayMs).toISOString();

const first: ResumeSummaryDto = {
  id: firstId,
  title: 'Первое резюме',
  firstName: 'Анна',
  lastName: 'Петрова',
  headline: null,
  isPublished: true,
  unpublishAt: null,
  deletionScheduledAt: null,
  viewsLast7Days: 2,
  template: {
    id: editorResume.template.id,
    slug: editorResume.template.slug,
    name: editorResume.template.name,
    layout: editorResume.template.layout,
    theme: null,
  },
  createdAt: editorResume.createdAt,
  updatedAt: editorResume.updatedAt,
};
const second: ResumeSummaryDto = {
  ...first,
  id: secondId,
  title: 'Второе резюме',
  viewsLast7Days: 3,
};

export async function prepareResumeHome(page: Page, options: { scheduleFails?: boolean } = {}) {
  const actions: string[] = [];
  let scheduled = false;
  let removed = false;
  let dismissed = false;

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();
    if (path === '/api/auth/refresh') {
      await route.fulfill({ json: session });
      return;
    }
    if (path === '/api/resumes' && method === 'GET') {
      const items = removed
        ? [second]
        : [{ ...first, deletionScheduledAt: scheduled ? scheduledFor : null }, second];
      await route.fulfill({ json: { items, total: items.length, page: 1, limit: 10 } });
      return;
    }
    if (path === '/api/resumes/overview') {
      const selected = url.searchParams.get('resumeId');
      const selectedResume = selected === firstId ? first : selected === secondId ? second : null;
      const today = Date.UTC(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth(),
        new Date().getUTCDate(),
      );
      const chartCounts = selected === firstId ? [1, 1] : selected === secondId ? [1, 2] : [2, 3];
      const overview: ResumeOverviewDto = {
        total: removed ? 1 : 2,
        publishedCount: removed ? 1 : 2,
        viewsTotal: selectedResume ? (selected === firstId ? 2 : 3) : 5,
        viewsLast7Days: selectedResume ? (selected === firstId ? 2 : 3) : 5,
        dailyViews: Array.from({ length: chartDays }, (_, index) => ({
          date: new Date(today - (chartDays - index - 1) * dayMs).toISOString().slice(0, 10),
          count: chartCounts[index - (chartDays - chartCounts.length)] ?? 0,
        })),
        selectedResume: selectedResume
          ? { id: selectedResume.id, title: selectedResume.title }
          : null,
        latestResume: removed
          ? second
          : { ...first, deletionScheduledAt: scheduled ? scheduledFor : null },
        scheduledLinks:
          scheduled && !removed
            ? [{ id: firstId, title: first.title, kind: 'delete', scheduledFor }]
            : [],
      };
      await route.fulfill({ json: overview });
      return;
    }
    if (path === '/api/resumes/deletions/notices' && method === 'GET') {
      await route.fulfill({
        json: removed && !dismissed ? [{ resumeId: firstId, title: first.title, deleteAfter }] : [],
      });
      return;
    }
    if (path === '/api/resumes/deletions/notices/dismiss' && method === 'POST') {
      dismissed = true;
      actions.push(`${method} ${path}`);
      await route.fulfill({ status: 204 });
      return;
    }
    if (path === `/api/resumes/${firstId}/deletion-schedule`) {
      actions.push(`${method} ${path}`);
      if (method === 'POST' && options.scheduleFails) {
        await route.fulfill({ status: 500, json: { message: 'Ошибка очереди' } });
        return;
      }
      scheduled = method === 'POST';
      await route.fulfill(method === 'POST' ? { json: { scheduledFor } } : { status: 204 });
      return;
    }
    if (path === `/api/resumes/${firstId}` && method === 'DELETE') {
      actions.push(`${method} ${path}`);
      removed = true;
      scheduled = false;
      await route.fulfill({ status: 204 });
      return;
    }
    throw new Error(`Неожиданный запрос API: ${method} ${path}`);
  });

  return { actions, firstId, secondId };
}
