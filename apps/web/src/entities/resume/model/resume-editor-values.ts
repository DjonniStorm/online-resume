import type {
  ResumeDto,
  ResumeSectionDto,
  UpdateResumeDto,
} from '@/shared/api/generated/types.gen';

export type ResumeEditorSection = {
  type: ResumeSectionDto['type'];
  isVisible: boolean;
};

export type ResumeEditorValues = {
  title: string;
  firstName: string;
  lastName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  githubUrl: string;
  telegramHandle: string;
  websiteUrl: string;
  about: string;
  sections: ResumeEditorSection[];
  experiences: Array<{
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description: string;
  }>;
  educations: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  skills: Array<{ name: string; level: string }>;
  languages: Array<{ name: string; proficiency: string }>;
  projects: Array<{
    name: string;
    role: string;
    description: string;
    url: string;
    startDate: string;
    endDate: string;
  }>;
  certificates: Array<{
    name: string;
    issuer: string;
    issuedAt: string;
    expiresAt: string;
    credentialUrl: string;
  }>;
};

export function resumeToEditorValues(resume: ResumeDto): ResumeEditorValues {
  return {
    title: resume.title,
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
    sections: [...resume.sections]
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map(({ type, isVisible }) => ({ type, isVisible })),
    experiences: resume.experiences.map((item) => ({
      company: item.company,
      position: item.position,
      location: item.location ?? '',
      startDate: dateToInput(item.startDate),
      endDate: dateToInput(item.endDate),
      isCurrent: item.isCurrent,
      description: item.description ?? '',
    })),
    educations: resume.educations.map((item) => ({
      institution: item.institution,
      degree: item.degree ?? '',
      fieldOfStudy: item.fieldOfStudy ?? '',
      location: item.location ?? '',
      startDate: dateToInput(item.startDate),
      endDate: dateToInput(item.endDate),
      description: item.description ?? '',
    })),
    skills: resume.skills.map((item) => ({ name: item.name, level: item.level ?? '' })),
    languages: resume.languages.map((item) => ({
      name: item.name,
      proficiency: item.proficiency ?? '',
    })),
    projects: resume.projects.map((item) => ({
      name: item.name,
      role: item.role ?? '',
      description: item.description ?? '',
      url: item.url ?? '',
      startDate: dateToInput(item.startDate),
      endDate: dateToInput(item.endDate),
    })),
    certificates: resume.certificates.map((item) => ({
      name: item.name,
      issuer: item.issuer ?? '',
      issuedAt: dateToInput(item.issuedAt),
      expiresAt: dateToInput(item.expiresAt),
      credentialUrl: item.credentialUrl ?? '',
    })),
  };
}

export function editorValuesToUpdateInput(
  values: ResumeEditorValues,
  revision: number,
): UpdateResumeDto {
  return {
    revision,
    title: values.title.trim(),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    headline: optionalValue(values.headline),
    email: optionalValue(values.email),
    phone: optionalValue(values.phone),
    location: optionalValue(values.location),
    githubUrl: normalizeGitHub(values.githubUrl),
    telegramHandle: optionalValue(values.telegramHandle),
    websiteUrl: normalizeWebsite(values.websiteUrl),
    about: optionalValue(values.about),
    sections: values.sections.map((section) => ({ ...section })),
    experiences: values.experiences.filter(hasAnyValue).map((item) => ({
      company: item.company.trim(),
      position: item.position.trim(),
      location: optionalValue(item.location),
      startDate: optionalValue(item.startDate),
      endDate: optionalValue(item.endDate),
      isCurrent: item.isCurrent,
      description: optionalValue(item.description),
    })),
    educations: values.educations.filter(hasAnyValue).map((item) => ({
      institution: item.institution.trim(),
      degree: optionalValue(item.degree),
      fieldOfStudy: optionalValue(item.fieldOfStudy),
      location: optionalValue(item.location),
      startDate: optionalValue(item.startDate),
      endDate: optionalValue(item.endDate),
      description: optionalValue(item.description),
    })),
    skills: values.skills.filter(hasAnyValue).map((item) => ({
      name: item.name.trim(),
      level: optionalValue(item.level),
    })),
    languages: values.languages.filter(hasAnyValue).map((item) => ({
      name: item.name.trim(),
      proficiency: optionalValue(item.proficiency),
    })),
    projects: values.projects.filter(hasAnyValue).map((item) => ({
      name: item.name.trim(),
      role: optionalValue(item.role),
      description: optionalValue(item.description),
      url: optionalValue(item.url),
      startDate: optionalValue(item.startDate),
      endDate: optionalValue(item.endDate),
    })),
    certificates: values.certificates.filter(hasAnyValue).map((item) => ({
      name: item.name.trim(),
      issuer: optionalValue(item.issuer),
      issuedAt: optionalValue(item.issuedAt),
      expiresAt: optionalValue(item.expiresAt),
      credentialUrl: optionalValue(item.credentialUrl),
    })),
  };
}

function dateToInput(value?: string | null): string {
  return value ? value.slice(0, 10) : '';
}

function optionalValue(value: string): string | undefined {
  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

function normalizeGitHub(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/^http:\/\//i, 'https://');
  }
  return `https://github.com/${trimmed.replace(/^(?:www\.)?github\.com\//i, '')}`;
}

function normalizeWebsite(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function hasAnyValue(value: Record<string, unknown>): boolean {
  return Object.values(value).some((item) =>
    typeof item === 'string' ? item.trim().length > 0 : Boolean(item),
  );
}
