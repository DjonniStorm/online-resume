// Время жизни access-токена: 15 минут.
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

// Время жизни refresh-токена и cookie: 30 дней.
export const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

// Максимальная длина JWT в cookie, чтобы не обрабатывать чрезмерно большие значения.
export const MAX_REFRESH_TOKEN_LENGTH = 4096;

export const REFRESH_COOKIE_NAME = 'resume_refresh';
