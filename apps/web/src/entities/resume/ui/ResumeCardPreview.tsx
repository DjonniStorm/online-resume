import type { CSSProperties } from 'react';

import type { ResumeSummaryDto } from '@/shared/api/generated/types.gen';

import styles from './ResumeCardPreview.module.css';

export function ResumeCardPreview({ resume }: { resume: ResumeSummaryDto }) {
  const theme = resume.template.theme;
  const colors = {
    '--preview-primary': theme?.primaryColor ?? '#17324d',
    '--preview-page': theme?.pageColor ?? '#fff',
    '--preview-header': theme?.headerColor ?? '#17324d',
    '--preview-sidebar': theme?.sidebarColor ?? '#edf0f2',
  } as CSSProperties;

  return (
    <div
      className={styles.preview}
      data-layout={resume.template.layout}
      style={colors}
      aria-hidden="true"
    >
      <div className={styles.sidebar}>
        <span className={styles.initials}>
          {resume.firstName.slice(0, 1)}
          {resume.lastName.slice(0, 1)}
        </span>
        <span className={styles.line} />
        <span className={styles.shortLine} />
        <span className={styles.line} />
      </div>
      <div className={styles.document}>
        <div className={styles.header}>
          <strong>
            {resume.firstName} {resume.lastName}
          </strong>
          {resume.headline ? <span>{resume.headline}</span> : null}
        </div>
        <div className={styles.content}>
          <span className={styles.sectionLine} />
          <span className={styles.line} />
          <span className={styles.line} />
          <span className={styles.shortLine} />
          <span className={styles.sectionLine} />
          <span className={styles.line} />
          <span className={styles.shortLine} />
        </div>
      </div>
    </div>
  );
}
