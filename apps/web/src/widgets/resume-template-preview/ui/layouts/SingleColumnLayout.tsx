import type { ResumeTemplateLayoutProps } from '../../model/layout-types';
import { ResumeHeader } from '../ResumeHeader';
import { ResumeSection } from '../ResumeSection';
import styles from '../ResumeTemplatePreview.module.css';

export function SingleColumnLayout({ data, sectionsByRegion, theme }: ResumeTemplateLayoutProps) {
  return (
    <div className={styles.singleColumn}>
      <ResumeHeader data={data} sections={sectionsByRegion.HEADER} theme={theme} />
      <main className={styles.main}>
        {sectionsByRegion.MAIN.map((section) => (
          <ResumeSection key={section.id} section={section} data={data} theme={theme} />
        ))}
      </main>
    </div>
  );
}
