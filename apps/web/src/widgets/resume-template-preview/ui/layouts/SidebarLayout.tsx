import type { ResumeTemplateLayoutProps } from '../../model/layout-types';
import { ResumeHeader } from '../ResumeHeader';
import { ResumeSection } from '../ResumeSection';
import styles from '../ResumeTemplatePreview.module.css';

export function SidebarLayout({ data, sectionsByRegion, theme }: ResumeTemplateLayoutProps) {
  return (
    <div className={styles.sidebarLayout}>
      <header className={styles.header}>
        <ResumeHeader data={data} sections={sectionsByRegion.HEADER} theme={theme} />
      </header>
      <div className={styles.columns}>
        <aside className={styles.sidebar}>
          {sectionsByRegion.SIDEBAR.map((section) => (
            <ResumeSection key={section.id} section={section} data={data} theme={theme} />
          ))}
        </aside>
        <main className={styles.main}>
          {sectionsByRegion.MAIN.map((section) => (
            <ResumeSection key={section.id} section={section} data={data} theme={theme} />
          ))}
        </main>
      </div>
    </div>
  );
}
