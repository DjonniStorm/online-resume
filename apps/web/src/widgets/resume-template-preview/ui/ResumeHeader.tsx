import type { TemplateSectionDto, TemplateThemeDto } from '@/shared/api/generated/types.gen';

import type { ResumePreviewData } from '../model/resume-preview-data';
import styles from './ResumeTemplatePreview.module.css';

type ResumeHeaderProps = {
  data: ResumePreviewData;
  sections: TemplateSectionDto[];
  theme: TemplateThemeDto;
};

export function ResumeHeader({ data, sections, theme }: ResumeHeaderProps) {
  const contactSection = sections.find((section) => section.type === 'CONTACTS');
  const hasContacts = [
    data.email,
    data.phone,
    data.location,
    data.githubUrl,
    data.telegramHandle,
    data.websiteUrl,
  ].some(Boolean);

  return (
    <div className={styles.profile}>
      <h2
        className={styles.name}
        style={{ fontFamily: `${theme.titleFontFamily}, Arial, sans-serif` }}
      >
        {data.firstName} {data.lastName}
      </h2>
      <p className={styles.headline}>{data.headline}</p>
      {contactSection && hasContacts ? (
        <div className={styles.headerContacts}>
          {contactSection.showHeading ? (
            <h3
              className={styles.sectionHeading}
              style={{ color: contactSection.accentColor ?? theme.primaryColor }}
            >
              {contactSection.headingText ?? 'Контакты'}
            </h3>
          ) : null}
          <Contacts data={data} />
        </div>
      ) : null}
    </div>
  );
}

export function Contacts({ data }: { data: ResumePreviewData }) {
  const links = [
    { label: data.email, href: `mailto:${data.email}` },
    { label: data.phone, href: `tel:${data.phone.replace(/[^\d+]/g, '')}` },
    { label: data.githubUrl, href: githubUrl(data.githubUrl) },
    { label: data.telegramHandle, href: telegramUrl(data.telegramHandle) },
    { label: data.websiteUrl, href: externalUrl(data.websiteUrl) },
  ];

  return (
    <div className={styles.contacts}>
      {links
        .filter((link) => link.label)
        .map((link) => (
          <a
            className={styles.contactLink}
            key={link.label}
            href={link.href}
            target={link.href.startsWith('https://') ? '_blank' : undefined}
            rel={link.href.startsWith('https://') ? 'noopener noreferrer' : undefined}
          >
            {link.label}
          </a>
        ))}
      {data.location ? <span>{data.location}</span> : null}
    </div>
  );
}

function externalUrl(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function githubUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  return `https://github.com/${value.replace(/^(?:www\.)?github\.com\//i, '')}`;
}

function telegramUrl(value: string): string {
  if (value.startsWith('@')) {
    return `https://t.me/${value.slice(1)}`;
  }
  return externalUrl(value);
}
