export const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

export type UploadedPhoto = {
  buffer: Buffer;
  mimetype: string;
  size: number;
};

export const PHOTO_MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
} as const;
