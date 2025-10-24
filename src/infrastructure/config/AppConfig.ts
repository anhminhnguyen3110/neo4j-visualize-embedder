import { env } from './env';

/**
 * Application configuration object
 * Centralized configuration for the entire application
 */
export const AppConfig = {
  app: {
    name: 'Neovis Embed Service',
    version: '1.0.0',
    env: env.NODE_ENV,
    port: env.PORT,
    host: env.HOST,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
  },

  database: {
    uri: env.NEO4J_URI,
    user: env.NEO4J_USER,
    password: env.NEO4J_PASSWORD,
    database: env.NEO4J_DATABASE,
  },

  sql: {
    path: env.SQLITE_DB_PATH,
  },

  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiration: env.JWT_EXPIRATION,
    jwtAlgorithm: env.JWT_ALGORITHM,
    bcryptRounds: env.BCRYPT_SALT_ROUNDS,
  },

  security: {
    cors: {
      origins: env.ALLOWED_ORIGINS.split(',').map((origin: string) => origin.trim()),
    },
  },

  embed: {
    baseUrl: env.EMBED_BASE_URL,
    maxTokenExpiryDays: env.MAX_TOKEN_EXPIRY_DAYS,
    defaultTokenExpiryDays: env.DEFAULT_TOKEN_EXPIRY_DAYS,
  },

  logging: {
    level: env.LOG_LEVEL,
  },
} as const;

export type AppConfigType = typeof AppConfig;
