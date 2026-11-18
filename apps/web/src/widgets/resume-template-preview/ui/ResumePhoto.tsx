import type { TemplateDto } from '@/shared/api/generated/types.gen';

import type { ResumePreviewData } from '../model/resume-preview-data';
import styles from './ResumeTemplatePreview.module.css';

export function ResumePhoto({
  data,
  shape,
}: {
  data: ResumePreviewData;
  shape: TemplateDto['photoShape'];
}) {
  return (
    <div className={styles.photo} data-shape={shape} aria-label="Место для фотографии">
      {data.firstName.slice(0, 1)}
      {data.lastName.slice(0, 1)}
    </div>
  );
}
