import type { TemplateSectionDto } from '@/shared/api/generated/types.gen';

export const sectionLabels: Record<TemplateSectionDto['type'], string> = {
  PROFILE: 'Профиль',
  ABOUT: 'О себе',
  CONTACTS: 'Контакты',
  EXPERIENCE: 'Опыт работы',
  EDUCATION: 'Образование',
  SKILLS: 'Навыки',
  LANGUAGES: 'Языки',
  PROJECTS: 'Проекты',
  CERTIFICATES: 'Сертификаты',
};
