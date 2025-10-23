import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment schema with Zod validation
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  HOST: z.string().default('0.0.0.0'),

  // Neo4j Database
  NEO4J_URI: z.string().url(),
  NEO4J_USER: z.string(),
  NEO4J_PASSWORD: z.string().min(1),
  NEO4J_DATABASE: z.string().default('neo4j'),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRATION: z.string().default('7d'),
  JWT_ALGORITHM: z.enum(['HS256', 'HS384', 'HS512', 'RS256']).default('HS256'),

  // Security
  BCRYPT_SALT_ROUNDS: z.string().transform(Number).default('12'),

  // CORS
  ALLOWED_ORIGINS: z.string(),

  // Embed
  EMBED_BASE_URL: z.string().url(),
  MAX_TOKEN_EXPIRY_DAYS: z.string().transform(Number).default('90'),
  DEFAULT_TOKEN_EXPIRY_DAYS: z.string().transform(Number).default('7'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Parse and validate environment variables
export const env = envSchema.parse(process.env);

// Export type for TypeScript
export type Env = z.infer<typeof envSchema>;
