import { afterEach, describe, expect, it } from 'vitest';

import configuration from './configuration';

describe('configuration', () => {
  const previousPort = process.env.API_PORT;
  const previousDatabaseUrl = process.env.DATABASE_URL;

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
  });

  it('reads the port and database url from the environment', () => {
    process.env.API_PORT = '4000';
    process.env.DATABASE_URL = 'postgresql://localhost/resume';

    expect(configuration()).toEqual({
      port: 4000,
      databaseUrl: 'postgresql://localhost/resume',
    });
  });
});
