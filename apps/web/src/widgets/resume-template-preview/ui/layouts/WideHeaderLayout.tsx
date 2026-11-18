import type { ResumeTemplateLayoutProps } from '../../model/layout-types';
import { ResumeHeader } from '../ResumeHeader';
import { ResumePhoto } from '../ResumePhoto';
import { ResumeSection } from '../ResumeSection';
import styles from '../ResumeTemplatePreview.module.css';

export function WideHeaderLayout({
  data,
  sectionsByRegion,
  theme,
  template,
}: ResumeTemplateLayoutProps) {
  return (
    <div className={styles.wideHeaderLayout}>
      <header className={styles.header}>
        {template.photoPlacement === 'HEADER_START' ? (
          <ResumePhoto data={data} shape={template.photoShape} />
        ) : null}
        <ResumeHeader data={data} sections={sectionsByRegion.HEADER} theme={theme} />
        {template.photoPlacement === 'HEADER_END' ? (
          <ResumePhoto data={data} shape={template.photoShape} />
        ) : null}
      </header>
      <div className={styles.columns}>
        <main className={styles.main}>
          {template.photoPlacement === 'MAIN_TOP' ? (
            <ResumePhoto data={data} shape={template.photoShape} />
          ) : null}
          {sectionsByRegion.MAIN.map((section) => (
            <ResumeSection key={section.id} section={section} data={data} theme={theme} />
          ))}
        </main>
        <aside className={styles.sidebar}>
          {template.photoPlacement === 'SIDEBAR_TOP' ? (
            <ResumePhoto data={data} shape={template.photoShape} />
          ) : null}
          {sectionsByRegion.SIDEBAR.map((section) => (
            <ResumeSection key={section.id} section={section} data={data} theme={theme} />
          ))}
        </aside>
      </div>
    </div>
  );
}
