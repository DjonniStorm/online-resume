import type { ResumeEditorValues } from '@/entities/resume';
import type { ResumeDto } from '@/shared/api/generated/types.gen';

import type { ResumePreviewData } from './resume-preview-data';

export function resumeToPreviewData(resume: ResumeDto): ResumePreviewData {
  return {
    firstName: resume.firstName,
    lastName: resume.lastName,
    headline: resume.headline ?? '',
    email: resume.email ?? '',
    phone: resume.phone ?? '',
    location: resume.location ?? '',
    githubUrl: resume.githubUrl ?? '',
    telegramHandle: resume.telegramHandle ?? '',
    websiteUrl: resume.websiteUrl ?? '',
    about: resume.about ?? '',
    experience: resume.experiences.map((item) => ({
      company: item.company,
      role: item.position,
      location: item.location ?? '',
      period: formatPeriod(item.startDate, item.endDate, item.isCurrent),
      description: item.description ?? '',
    })),
    education: resume.educations.map((item) => ({
      institution: item.institution,
      degree: [item.degree, item.fieldOfStudy].filter(Boolean).join(' · '),
      period: formatPeriod(item.startDate, item.endDate),
      location: item.location ?? '',
      description: item.description ?? '',
    })),
    skills: resume.skills.map((item) => ({
      name: item.name,
      level: mapSkillLevel(item.level),
    })),
    languages: resume.languages.map((item) => ({
      name: item.name,
      level: item.proficiency ?? '',
    })),
    projects: resume.projects.map((item) => ({
      name: item.name,
      role: item.role ?? '',
      period: formatPeriod(item.startDate, item.endDate),
      url: item.url ?? '',
      description: item.description ?? '',
    })),
    certificates: resume.certificates.map((item) => ({
      name: item.name,
      issuer: item.issuer ?? '',
      year: item.issuedAt ? new Date(item.issuedAt).getFullYear().toString() : '',
      expiresAt: item.expiresAt ? formatMonth(item.expiresAt) : '',
      credentialUrl: item.credentialUrl ?? '',
    })),
  };
}

export function editorValuesToPreviewData(values: ResumeEditorValues): ResumePreviewData {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    headline: values.headline,
    email: values.email,
    phone: values.phone,
    location: values.location,
    githubUrl: values.githubUrl,
    telegramHandle: values.telegramHandle,
    websiteUrl: values.websiteUrl,
    about: values.about,
    experience: values.experiences.map((item) => ({
      company: item.company,
      role: item.position,
      location: item.location,
      period: formatPeriod(item.startDate, item.endDate, item.isCurrent),
      description: item.description,
    })),
    education: values.educations.map((item) => ({
      institution: item.institution,
      degree: [item.degree, item.fieldOfStudy].filter(Boolean).join(' · '),
      period: formatPeriod(item.startDate, item.endDate),
      location: item.location,
      description: item.description,
    })),
    skills: values.skills.map((item) => ({
      name: item.name,
      level: mapSkillLevel(item.level),
    })),
    languages: values.languages.map((item) => ({
      name: item.name,
      level: item.proficiency,
    })),
    projects: values.projects.map((item) => ({
      name: item.name,
      role: item.role,
      period: formatPeriod(item.startDate, item.endDate),
      url: item.url,
      description: item.description,
    })),
    certificates: values.certificates.map((item) => ({
      name: item.name,
      issuer: item.issuer,
      year: item.issuedAt ? new Date(item.issuedAt).getFullYear().toString() : '',
      expiresAt: item.expiresAt ? formatMonth(item.expiresAt) : '',
      credentialUrl: item.credentialUrl,
    })),
  };
}

function formatPeriod(startDate?: string | null, endDate?: string | null, isCurrent = false) {
  const start = formatMonth(startDate);
  const end = isCurrent ? 'по настоящее время' : formatMonth(endDate);
  return [start, end].filter(Boolean).join(' — ');
}

function formatMonth(value?: string | null): string {
  if (!value) {
    return '';
  }
  return new Intl.DateTimeFormat('ru-RU', { month: 'short', year: 'numeric' }).format(
    new Date(value),
  );
}

function mapSkillLevel(value: string | null): 'Базовый' | 'Уверенный' | 'Продвинутый' {
  const normalized = value?.trim().toLocaleLowerCase('ru');
  if (normalized === 'базовый' || normalized === 'начальный' || normalized === 'basic') {
    return 'Базовый';
  }
  if (
    normalized === 'продвинутый' ||
    normalized === 'экспертный' ||
    normalized === 'advanced' ||
    normalized === 'expert'
  ) {
    return 'Продвинутый';
  }
  return 'Уверенный';
}
