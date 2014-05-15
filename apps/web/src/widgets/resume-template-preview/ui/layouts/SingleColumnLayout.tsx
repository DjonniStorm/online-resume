import type { ResumeTemplateLayoutProps } from '../../model/layout-types';
import { ResumeHeader } from '../ResumeHeader';
import { ResumePhoto } from '../ResumePhoto';
import { ResumeSection } from '../ResumeSection';
import styles from '../ResumeTemplatePreview.module.css';

export function SingleColumnLayout({
  data,
  sectionsByRegion,
  theme,
  template,
}: ResumeTemplateLayoutProps) {
  return (
    <div className={styles.singleColumn}>
      {template.photoPlacement === 'HEADER_START' ? (
        <ResumePhoto data={data} shape={template.photoShape} />
      ) : null}
      <ResumeHeader data={data} sections={sectionsByRegion.HEADER} theme={theme} />
      {template.photoPlacement === 'HEADER_END' || template.photoPlacement === 'MAIN_TOP' ? (
        <ResumePhoto data={data} shape={template.photoShape} />
      ) : null}
      <main className={styles.main}>
        {sectionsByRegion.MAIN.map((section) => (
          <ResumeSection key={section.id} section={section} data={data} theme={theme} />
        ))}
      </main>
    </div>
  );
}
