import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value !== 'string') return value;

  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes'].includes(normalized)) return true;
  if (['false', '0', 'no'].includes(normalized)) return false;

  return value;
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(3333),
  WEB_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(16).default('change-me-in-development-only'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  UPLOAD_MAX_MB: z.coerce.number().default(4),
  AUTH_COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).optional(),
  AUTH_COOKIE_SECURE: booleanFromEnv.optional()
});

export const env = envSchema.parse(process.env);

export const webOrigins = env.WEB_ORIGIN
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const authCookieSecure = env.AUTH_COOKIE_SECURE ?? env.NODE_ENV === 'production';
export const authCookieSameSite = env.AUTH_COOKIE_SAME_SITE ?? (env.NODE_ENV === 'production' ? 'none' : 'lax');

if (authCookieSameSite === 'none' && !authCookieSecure) {
  throw new Error('AUTH_COOKIE_SAME_SITE=none exige AUTH_COOKIE_SECURE=true.');
}
