import { afterEach, describe, expect, it } from 'vitest';

import configuration from './configuration';

describe('configuration', () => {
  const previousPort = process.env.API_PORT;
  const previousDatabaseUrl = process.env.DATABASE_URL;
  const previousAccessSecret = process.env.JWT_ACCESS_SECRET;
  const previousRefreshSecret = process.env.JWT_REFRESH_SECRET;

  afterEach(() => {
    if (previousPort === undefined) {
      delete process.env.API_PORT;
    } else {
      process.env.API_PORT = previousPort;
    }

    if (previousDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = previousDatabaseUrl;
    }
    if (previousAccessSecret === undefined) {
      delete process.env.JWT_ACCESS_SECRET;
    } else {
      process.env.JWT_ACCESS_SECRET = previousAccessSecret;
    }
    if (previousRefreshSecret === undefined) {
      delete process.env.JWT_REFRESH_SECRET;
    } else {
      process.env.JWT_REFRESH_SECRET = previousRefreshSecret;
    }
  });

  it('reads the port and database url from the environment', () => {
    process.env.API_PORT = '4000';
    process.env.DATABASE_URL = 'postgresql://localhost/resume';
    process.env.JWT_ACCESS_SECRET = 'access-secret';
    process.env.JWT_REFRESH_SECRET = 'refresh-secret';

    expect(configuration()).toEqual({
      port: 4000,
      databaseUrl: 'postgresql://localhost/resume',
      jwtAccessSecret: 'access-secret',
      jwtRefreshSecret: 'refresh-secret',
    });
  });
});
