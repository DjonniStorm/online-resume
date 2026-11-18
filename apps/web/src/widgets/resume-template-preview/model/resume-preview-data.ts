export type ResumePreviewData = {
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
  experience: Array<{
    company: string;
    role: string;
    period: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    period: string;
  }>;
  skills: Array<{ name: string; level: 'Базовый' | 'Уверенный' | 'Продвинутый' }>;
  languages: Array<{ name: string; level: string }>;
  projects: Array<{ name: string; description: string }>;
  certificates: Array<{ name: string; issuer: string; year: string }>;
};
