import { useEffect, useState } from 'react';

import type { ResumeStore } from './resume-store';

export function useResumePhotoUrl(
  resumes: ResumeStore,
  id: string,
  photoPath: string | null,
): string | null {
  const [photo, setPhoto] = useState<{ path: string; url: string } | null>(null);

  useEffect(() => {
    if (!photoPath) {
      return;
    }
    let active = true;
    let url: string | null = null;
    void resumes.getPhoto(id).then((blob) => {
      if (!blob || !active) {
        return;
      }
      url = URL.createObjectURL(blob);
      setPhoto({ path: photoPath, url });
    });
    return () => {
      active = false;
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [id, photoPath, resumes]);

  return photo?.path === photoPath ? photo.url : null;
}
