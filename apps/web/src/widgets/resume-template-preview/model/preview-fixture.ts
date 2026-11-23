import type { ResumePreviewData } from './resume-preview-data';

export const previewFixture: ResumePreviewData = {
  firstName: 'Анна',
  lastName: 'Петрова',
  headline: 'Frontend-разработчик и продуктовый дизайнер',
  email: 'anna.petrova@example.com',
  phone: '+7 900 123-45-67',
  location: 'Москва, Россия',
  githubUrl: 'github.com/annapetrova',
  telegramHandle: '@annapetrova',
  websiteUrl: 'annapetrova.dev',
  about:
    'Создаю понятные интерфейсы и превращаю сложные сценарии в аккуратные продукты. Люблю системный дизайн, быстрые прототипы и команды, в которых решения проверяются данными.',
  experience: [
    {
      company: 'North Star Studio',
      role: 'Senior Frontend Developer',
      location: '',
      period: '2023 — сейчас',
      description:
        'Развиваю библиотеку компонентов и отвечаю за клиентскую часть SaaS-продукта. Запустила новую навигацию и сократила время первого полезного действия.',
    },
    {
      company: 'Forma Digital',
      role: 'Frontend Developer',
      location: '',
      period: '2020 — 2023',
      description:
        'Собирала личные кабинеты, внутренние инструменты и посадочные страницы. Работала вместе с дизайнерами над системой визуальных решений.',
    },
  ],
  education: [
    {
      institution: 'Московский политехнический университет',
      degree: 'Информационные системы и технологии',
      period: '2016 — 2020',
      location: '',
      description: '',
    },
  ],
  skills: [
    { name: 'React и TypeScript', level: 'Продвинутый' },
    { name: 'Дизайн-системы', level: 'Продвинутый' },
    { name: 'UX и прототипирование', level: 'Уверенный' },
    { name: 'Тестирование интерфейсов', level: 'Базовый' },
  ],
  languages: [
    { name: 'Русский', level: 'родной' },
    { name: 'English', level: 'C1' },
    { name: 'Español', level: 'A2' },
  ],
  projects: [
    {
      name: 'Design system starter',
      role: '',
      period: '',
      url: '',
      description: 'Набор компонентов и документация для трёх продуктовых команд.',
    },
    {
      name: 'Research dashboard',
      role: '',
      period: '',
      url: '',
      description: 'Панель для анализа обратной связи и поиска повторяющихся проблем.',
    },
  ],
  certificates: [
    {
      name: 'Accessibility fundamentals',
      issuer: 'W3C',
      year: '2024',
      expiresAt: '',
      credentialUrl: '',
    },
    {
      name: 'Product analytics',
      issuer: 'Product School',
      year: '2023',
      expiresAt: '',
      credentialUrl: '',
    },
  ],
};
