import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: '../../openapi.json',
  output: 'src/shared/api/generated',
  plugins: ['@hey-api/client-fetch', '@hey-api/sdk', 'zod'],
});
