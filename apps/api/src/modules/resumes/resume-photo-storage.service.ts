import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
} from '@nestjs/common';

import { MAX_PHOTO_SIZE, PHOTO_MIME_TYPES, type UploadedPhoto } from './common/photo';

const photoNamePattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp)$/i;

@Injectable()
export class ResumePhotoStorageService {
  private readonly directory = resolve(process.cwd(), 'uploads', 'resumes');

  async save(file: UploadedPhoto | undefined): Promise<string> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Выберите фотографию');
    }
    if (file.size > MAX_PHOTO_SIZE || file.buffer.length > MAX_PHOTO_SIZE) {
      throw new PayloadTooLargeException('Фотография должна быть не больше 5 МБ');
    }

    const extension = detectExtension(file.buffer);
    if (!extension || file.mimetype !== PHOTO_MIME_TYPES[extension]) {
      throw new BadRequestException('Поддерживаются только JPEG, PNG и WebP');
    }

    const name = `${randomUUID()}${extension}`;
    await mkdir(this.directory, { recursive: true });
    await writeFile(join(this.directory, name), file.buffer, { flag: 'wx' });
    return name;
  }

  async read(name: string | null): Promise<{ data: Buffer; type: string }> {
    if (!name || !photoNamePattern.test(name)) {
      throw new NotFoundException('Фотография не найдена');
    }
    try {
      const data = await readFile(join(this.directory, name));
      const type = PHOTO_MIME_TYPES[extname(name).toLowerCase() as keyof typeof PHOTO_MIME_TYPES];
      return { data, type };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new NotFoundException('Фотография не найдена');
      }
      throw error;
    }
  }

  async remove(name: string): Promise<void> {
    if (!photoNamePattern.test(name)) {
      return;
    }
    await rm(join(this.directory, name), { force: true });
  }
}

function detectExtension(data: Buffer): keyof typeof PHOTO_MIME_TYPES | null {
  if (data.length >= 4 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return '.jpg';
  }
  if (
    data.length >= 24 &&
    data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) &&
    data.toString('ascii', 12, 16) === 'IHDR'
  ) {
    return '.png';
  }
  if (
    data.length >= 16 &&
    data.toString('ascii', 0, 4) === 'RIFF' &&
    data.toString('ascii', 8, 12) === 'WEBP' &&
    ['VP8 ', 'VP8L', 'VP8X'].includes(data.toString('ascii', 12, 16))
  ) {
    return '.webp';
  }
  return null;
}
