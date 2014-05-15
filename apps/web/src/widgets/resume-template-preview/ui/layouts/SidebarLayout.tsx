import type { ResumeTemplateLayoutProps } from '../../model/layout-types';
import { ResumeHeader } from '../ResumeHeader';
import { ResumePhoto } from '../ResumePhoto';
import { ResumeSection } from '../ResumeSection';
import styles from '../ResumeTemplatePreview.module.css';

export function SidebarLayout({
  data,
  sectionsByRegion,
  theme,
  template,
}: ResumeTemplateLayoutProps) {
  return (
    <div
      className={styles.sidebarLayout}
      data-side={template.layout === 'SIDEBAR_RIGHT' ? 'right' : 'left'}
    >
      <div className={styles.columns}>
        <aside className={styles.sidebar}>
          {template.photoPlacement === 'SIDEBAR_TOP' ? (
            <ResumePhoto data={data} shape={template.photoShape} />
          ) : null}
          {sectionsByRegion.SIDEBAR.map((section) => (
            <ResumeSection key={section.id} section={section} data={data} theme={theme} />
          ))}
        </aside>
        <div className={styles.mainArea}>
          <header className={styles.header}>
            {template.photoPlacement === 'HEADER_START' ? (
              <ResumePhoto data={data} shape={template.photoShape} />
            ) : null}
            <ResumeHeader data={data} sections={sectionsByRegion.HEADER} theme={theme} />
            {template.photoPlacement === 'HEADER_END' ? (
              <ResumePhoto data={data} shape={template.photoShape} />
            ) : null}
          </header>
          <main className={styles.main}>
            {template.photoPlacement === 'MAIN_TOP' ? (
              <ResumePhoto data={data} shape={template.photoShape} />
            ) : null}
            {sectionsByRegion.MAIN.map((section) => (
              <ResumeSection key={section.id} section={section} data={data} theme={theme} />
            ))}
          </main>
        </div>
      </div>
    </div>
  );
}
