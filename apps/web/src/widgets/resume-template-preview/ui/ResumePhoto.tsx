import type { TemplateDto } from '@/shared/api/generated/types.gen';

import type { ResumePreviewData } from '../model/resume-preview-data';
import styles from './ResumeTemplatePreview.module.css';

export function ResumePhoto({
  data,
  shape,
  photoUrl,
}: {
  data: ResumePreviewData;
  shape: TemplateDto['photoShape'];
  photoUrl?: string | null;
}) {
  return (
    <div className={styles.photo} data-shape={shape} aria-label="Место для фотографии">
      {photoUrl === undefined ? (
        <>
          {data.firstName.slice(0, 1)}
          {data.lastName.slice(0, 1)}
        </>
      ) : (
        <img
          key={photoUrl}
          src={photoUrl ?? '/resume-photo-fallback.svg'}
          alt="Фото кандидата"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = '/resume-photo-fallback.svg';
          }}
        />
      )}
    </div>
  );
}
