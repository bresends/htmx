import { env } from '@/env';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema';

const migrationClient = postgres(env.DATABASE_URL, { max: 1 });

export const db = drizzle(migrationClient, { schema });

async function main() {
    try {
        await migrate(db, {
            migrationsFolder: 'drizzle',
        });
        console.log('Tables migrated!');
        process.exit(0);
    } catch (error) {
        console.error('Error performing migration: ', error);
        process.exit(1);
    }
}

main();
