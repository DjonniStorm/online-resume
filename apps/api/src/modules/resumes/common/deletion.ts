export const RESUME_DELETION_DAYS = 30;
export const RESUME_LINK_GRACE_DAYS = 3;
export const RESUME_CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

export function resumeDeleteAfter(now = new Date()): Date {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() + RESUME_DELETION_DAYS);
  return date;
}

export function resumeLinkExpiresAt(now = new Date()): Date {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() + RESUME_LINK_GRACE_DAYS);
  return date;
}
