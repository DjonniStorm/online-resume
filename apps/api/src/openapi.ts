import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'reflect-metadata';

import { AppModule } from './app.module';

async function generateOpenApi() {
  process.env.RESUME_CLEANUP_DISABLED = 'true';
  process.env.DATABASE_URL ||= 'postgresql://openapi:openapi@localhost:5432/openapi';
  process.env.JWT_ACCESS_SECRET ||= 'openapi-generation-access-secret-placeholder';
  process.env.JWT_REFRESH_SECRET ||= 'openapi-generation-refresh-secret-placeholder';

  const app = await NestFactory.create(AppModule, { logger: false });
  try {
    app.setGlobalPrefix('api');
    const config = new DocumentBuilder()
      .setTitle('Online Resume API')
      .setVersion('1.0.0')
      .addBearerAuth()
      .addCookieAuth('resume_refresh')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    const outputPath = resolve(process.cwd(), '../../openapi.json');
    await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`);
  } finally {
    await app.close();
  }
}

generateOpenApi().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
