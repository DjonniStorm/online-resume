import type { ReactNode } from 'react';
import { match } from 'ts-pattern';

import type { TemplateSectionDto, TemplateThemeDto } from '@/shared/api/generated/types.gen';

import type { ResumePreviewData } from '../model/resume-preview-data';
import { Contacts } from './ResumeHeader';
import styles from './ResumeTemplatePreview.module.css';

type SectionType = TemplateSectionDto['type'];
type SkillLevel = ResumePreviewData['skills'][number]['level'];

const skillLevelWidth: Record<SkillLevel, string> = {
  Базовый: '33%',
  Уверенный: '67%',
  Продвинутый: '100%',
};

type ResumeSectionProps = {
  section: TemplateSectionDto;
  data: ResumePreviewData;
  theme: TemplateThemeDto;
};

export function ResumeSection({ section, data, theme }: ResumeSectionProps) {
  if (!hasContent(section.type, data)) {
    return null;
  }
  return (
    <section className={styles.section} data-layout={section.itemLayout}>
      {section.showHeading && section.type !== 'PROFILE' ? (
        <h3
          className={styles.sectionHeading}
          style={{ color: section.accentColor ?? theme.primaryColor }}
        >
          {section.headingText ?? sectionTitle(section.type)}
        </h3>
      ) : null}
      <SectionContent type={section.type} data={data} />
    </section>
  );
}

function hasContent(type: SectionType, data: ResumePreviewData): boolean {
  return match(type)
    .with('PROFILE', () => false)
    .with('ABOUT', () => Boolean(data.about))
    .with('CONTACTS', () =>
      [
        data.email,
        data.phone,
        data.location,
        data.githubUrl,
        data.telegramHandle,
        data.websiteUrl,
      ].some(Boolean),
    )
    .with('EXPERIENCE', () => data.experience.length > 0)
    .with('EDUCATION', () => data.education.length > 0)
    .with('SKILLS', () => data.skills.length > 0)
    .with('LANGUAGES', () => data.languages.length > 0)
    .with('PROJECTS', () => data.projects.length > 0)
    .with('CERTIFICATES', () => data.certificates.length > 0)
    .exhaustive();
}

function SectionContent({ type, data }: { type: SectionType; data: ResumePreviewData }): ReactNode {
  return match(type)
    .with('ABOUT', () => <p>{data.about}</p>)
    .with('CONTACTS', () => <Contacts data={data} />)
    .with('EXPERIENCE', () => (
      <div>
        {data.experience.map((item) => (
          <div className={styles.entry} key={`${item.company}-${item.role}`}>
            <div className={styles.entryHeading}>
              <strong className={styles.entryTitle}>{item.role}</strong>
              <span className={styles.entryPeriod}>{item.period}</span>
            </div>
            <p className={styles.entrySubtitle}>{item.company}</p>
            {item.location ? <p>{item.location}</p> : null}
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    ))
    .with('EDUCATION', () => (
      <div>
        {data.education.map((item) => (
          <div className={styles.entry} key={`${item.institution}-${item.degree}`}>
            <div className={styles.entryHeading}>
              <strong className={styles.entryTitle}>{item.degree}</strong>
              <span className={styles.entryPeriod}>{item.period}</span>
            </div>
            <p className={styles.entrySubtitle}>{item.institution}</p>
            {item.location ? <p>{item.location}</p> : null}
            {item.description ? <p>{item.description}</p> : null}
          </div>
        ))}
      </div>
    ))
    .with('SKILLS', () => (
      <div>
        {data.skills.map((item) => (
          <div className={styles.skill} key={item.name}>
            <div className={styles.skillLabel}>
              <span>{item.name}</span>
              <span>{item.level}</span>
            </div>
            <div className={styles.skillTrack}>
              <div className={styles.skillFill} style={{ width: skillLevelWidth[item.level] }} />
            </div>
          </div>
        ))}
      </div>
    ))
    .with('LANGUAGES', () => (
      <div className={styles.languageList}>
        {data.languages.map((item) => (
          <span className={styles.language} key={item.name}>
            {item.name} · {item.level}
          </span>
        ))}
      </div>
    ))
    .with('PROJECTS', () => (
      <div>
        {data.projects.map((item) => (
          <div className={styles.entry} key={item.name}>
            <div className={styles.entryHeading}>
              <strong className={styles.entryTitle}>{item.name}</strong>
              {item.period ? <span className={styles.entryPeriod}>{item.period}</span> : null}
            </div>
            {item.role ? <p className={styles.entrySubtitle}>{item.role}</p> : null}
            <p>{item.description}</p>
            {item.url ? (
              <p>
                <a
                  href={/^https?:\/\//i.test(item.url) ? item.url : `https://${item.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.url}
                </a>
              </p>
            ) : null}
          </div>
        ))}
      </div>
    ))
    .with('CERTIFICATES', () => (
      <div>
        {data.certificates.map((item) => (
          <div className={styles.entry} key={item.name}>
            <strong className={styles.entryTitle}>{item.name}</strong>
            <p className={styles.entrySubtitle}>
              {item.issuer} · {item.year}
            </p>
            {item.expiresAt ? <p>Действует до {item.expiresAt}</p> : null}
            {item.credentialUrl ? (
              <p>
                <a
                  href={
                    /^https?:\/\//i.test(item.credentialUrl)
                      ? item.credentialUrl
                      : `https://${item.credentialUrl}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.credentialUrl}
                </a>
              </p>
            ) : null}
          </div>
        ))}
      </div>
    ))
    .with('PROFILE', () => null)
    .exhaustive();
}

function sectionTitle(type: SectionType): string {
  const titles: Record<SectionType, string> = {
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
  return titles[type];
}
