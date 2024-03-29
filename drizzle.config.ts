import { defineConfig } from 'drizzle-kit';
import { env } from './env';

export default defineConfig({
    schema: './src/database/schema.ts',
    out: './drizzle',
    driver: 'pg',
    dbCredentials: {
        connectionString: env.DATABASE_URL,
    },
    verbose: true,
    strict: true,
});
