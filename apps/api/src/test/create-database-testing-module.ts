import type { ModuleMetadata } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import 'reflect-metadata';

import { PrismaService } from '../database/prisma.service';

export async function createDatabaseTestingModule({
  providers = [],
  ...metadata
}: ModuleMetadata = {}): Promise<TestingModule> {
  const databaseUrl = process.env.TEST_DATABASE_URL;
  if (!databaseUrl || !new URL(databaseUrl).pathname.endsWith('_test')) {
    throw new Error(
      'Укажите TEST_DATABASE_URL для отдельной базы с именем, оканчивающимся на _test.',
    );
  }

  const moduleRef = await Test.createTestingModule({
    ...metadata,
    providers: [
      { provide: ConfigService, useValue: new ConfigService({ databaseUrl }) },
      PrismaService,
      ...providers,
    ],
  }).compile();

  try {
    await moduleRef.init();
    return moduleRef;
  } catch (error) {
    await moduleRef.close();
    throw error;
  }
}
