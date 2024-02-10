import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('8080'),
  DATABASE_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
