export default () => ({
  port: Number(process.env.API_PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbDb: process.env.DB_DB,
});
