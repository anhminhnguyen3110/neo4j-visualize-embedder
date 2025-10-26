import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  HOST: z.string().default('0.0.0.0'),

  NEO4J_URI: z.string().url(),
  NEO4J_USER: z.string(),
  NEO4J_PASSWORD: z.string().min(1),
  NEO4J_DATABASE: z.string().default('neo4j'),

  SQLITE_DB_PATH: z.string().default('./data/embedder.db'),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRATION: z.string().default('7d'),
  JWT_ALGORITHM: z.enum(['HS256', 'HS384', 'HS512', 'RS256']).default('HS256'),

  BCRYPT_SALT_ROUNDS: z.string().transform(Number).default('12'),

  ALLOWED_ORIGINS: z.string(),

  EMBED_BASE_URL: z.string().url(),
  MAX_TOKEN_EXPIRY_DAYS: z.string().transform(Number).default('90'),
  DEFAULT_TOKEN_EXPIRY_DAYS: z.string().transform(Number).default('7'),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
