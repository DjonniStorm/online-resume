import type { AuthResultDto, ResumeDto } from '../../../src/shared/api/generated/types.gen';
import { templates } from './templates';

export const editorResumeId = 'resume-for-browser-test';

export const session: AuthResultDto = {
  accessToken: 'browser-test-token',
  tokenType: 'Bearer',
  expiresIn: 3600,
  user: {
    id: 'browser-test-user',
    email: 'user@example.test',
    firstName: 'Анна',
    lastName: 'Петрова',
    githubUrl: null,
    telegramHandle: null,
    websiteUrl: null,
    role: 'USER',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
};

export const editorResume: ResumeDto = {
  id: editorResumeId,
  isPublished: false,
  unpublishAt: null,
  publicSlug: null,
  revision: 1,
  title: 'Первое резюме',
  firstName: 'Анна',
  lastName: 'Петрова',
  headline: null,
  email: null,
  phone: null,
  location: null,
  githubUrl: null,
  telegramHandle: null,
  websiteUrl: null,
  about: null,
  photoPath: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  template: templates[0]!,
  sections: [{ id: 'profile-section', type: 'PROFILE', sortOrder: 0, isVisible: true }],
  experiences: [],
  educations: [],
  skills: [],
  languages: [],
  projects: [],
  certificates: [],
};
