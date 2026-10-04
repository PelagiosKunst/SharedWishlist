import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as schema from './db/schema';
import type { Db } from './lists';

/** Frische In-Memory-Datenbank mit allen Migrationen, nur für Tests. */
export async function createTestDb(): Promise<Db> {
	const client = createClient({ url: ':memory:' });
	await client.execute('PRAGMA foreign_keys = ON');
	const db = drizzle(client, { schema });
	await migrate(db, { migrationsFolder: 'drizzle' });
	return db;
}
