import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { building } from '$app/env';
import * as schema from './schema';
import { DATABASE_URL } from '$app/env/private';
import type { Db } from '../lists.ts';

async function connect(): Promise<Db> {
	if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');
	const client = createClient({ url: DATABASE_URL });
	// SQLite prüft Fremdschlüssel nur, wenn es pro Verbindung eingeschaltet ist.
	await client.execute('PRAGMA foreign_keys = ON');
	return drizzle(client, { schema });
}

// Beim Build analysiert SvelteKit die App, ohne Anfragen zu bearbeiten. Eine offene
// Verbindung des nativen libSQL-Treibers lässt den Build-Prozess unter Windows abstürzen.
export const db: Db = building ? (undefined as unknown as Db) : await connect();
