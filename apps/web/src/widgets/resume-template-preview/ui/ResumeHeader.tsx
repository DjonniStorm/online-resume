import type { TemplateSectionDto, TemplateThemeDto } from '@/shared/api/generated/types.gen';

import type { ResumePreviewData } from '../model/resume-preview-data';
import styles from './ResumeTemplatePreview.module.css';

type ResumeHeaderProps = {
  data: ResumePreviewData;
  sections: TemplateSectionDto[];
  theme: TemplateThemeDto;
};

export function ResumeHeader({ data, sections, theme }: ResumeHeaderProps) {
  const hasContacts = sections.some((section) => section.type === 'CONTACTS');

  return (
    <div style={{ fontFamily: `${theme.titleFontFamily}, Arial, sans-serif` }}>
      <p className={styles.eyebrow}>Online Resume</p>
      <h2 className={styles.name}>
        {data.firstName} {data.lastName}
      </h2>
      <p className={styles.headline}>{data.headline}</p>
      {hasContacts ? <Contacts data={data} /> : null}
    </div>
  );
}

export function Contacts({ data }: { data: ResumePreviewData }) {
  const links = [
    { label: data.email, href: `mailto:${data.email}` },
    { label: data.phone, href: `tel:${data.phone.replace(/[^\d+]/g, '')}` },
    { label: data.githubUrl, href: externalUrl(data.githubUrl) },
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

function telegramUrl(value: string): string {
  if (value.startsWith('@')) {
    return `https://t.me/${value.slice(1)}`;
  }
  return externalUrl(value);
}
