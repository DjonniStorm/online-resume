import type { ResumeTemplateLayoutProps } from '../../model/layout-types';
import { ResumeHeader } from '../ResumeHeader';
import { ResumePhoto } from '../ResumePhoto';
import { ResumeSection } from '../ResumeSection';
import styles from '../ResumeTemplatePreview.module.css';

export function SidebarLayout({
  data,
  photoUrl,
  sectionsByRegion,
  theme,
  template,
}: ResumeTemplateLayoutProps) {
  const header = (
    <header className={styles.header}>
      {template.photoPlacement === 'HEADER_START' ? (
        <ResumePhoto data={data} photoUrl={photoUrl} shape={template.photoShape} />
      ) : null}
      <ResumeHeader data={data} sections={sectionsByRegion.HEADER} theme={theme} />
      {template.photoPlacement === 'HEADER_END' ? (
        <ResumePhoto data={data} photoUrl={photoUrl} shape={template.photoShape} />
      ) : null}
    </header>
  );

  return (
    <div
      className={styles.sidebarLayout}
      data-side={template.layout === 'SIDEBAR_RIGHT' ? 'right' : 'left'}
    >
      {template.layout === 'SIDEBAR_RIGHT' ? header : null}
      <div className={styles.columns}>
        <aside className={styles.sidebar}>
          {template.photoPlacement === 'SIDEBAR_TOP' ? (
            <ResumePhoto data={data} photoUrl={photoUrl} shape={template.photoShape} />
          ) : null}
          {sectionsByRegion.SIDEBAR.map((section) => (
            <ResumeSection key={section.id} section={section} data={data} theme={theme} />
          ))}
        </aside>
        <div className={styles.mainArea}>
          {template.layout === 'SIDEBAR_LEFT' ? header : null}
          <main className={styles.main}>
            {template.photoPlacement === 'MAIN_TOP' ? (
              <ResumePhoto data={data} photoUrl={photoUrl} shape={template.photoShape} />
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
