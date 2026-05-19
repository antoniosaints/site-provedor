import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(3333),
  WEB_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(16).default('change-me-in-development-only'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  UPLOAD_MAX_MB: z.coerce.number().default(4)
});

export const env = envSchema.parse(process.env);
