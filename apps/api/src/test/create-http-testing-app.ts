import { randomBytes } from 'node:crypto';

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import 'reflect-metadata';

import { AppModule } from '../app.module';
import { ResumeCleanupService } from '../modules/resumes/resume-cleanup.service';
import { getTestDatabaseUrl } from './create-database-testing-module';

type HttpTestingAppOptions = { photoDirectory?: string };

export async function createHttpTestingApp(options: HttpTestingAppOptions = {}) {
  const config = new ConfigService({
    databaseUrl: getTestDatabaseUrl(),
    resumePhotoDirectory: options.photoDirectory,
    jwtAccessSecret: randomBytes(32).toString('hex'),
    jwtRefreshSecret: randomBytes(32).toString('hex'),
  });
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(ConfigService)
    .useValue(config)
    .overrideProvider(ResumeCleanupService)
    .useValue({})
    .compile();
  const app = moduleRef.createNestApplication({ logger: false });

  try {
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    );
    await app.listen(0, '127.0.0.1');
    return app;
  } catch (error) {
    await app.close();
    throw error;
  }
}
