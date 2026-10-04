import type { Handle } from '@sveltejs/kit/hooks';
import { db } from '#lib/server/db/index.ts';
import { ensureUser } from '#lib/server/lists.ts';

/**
 * M1: Bis der Magic Link (M2) da ist, arbeiten alle Anfragen als diese feste Test-Person.
 * Wird in M2 durch die echte Sitzung ersetzt.
 */
const DEV_OWNER_EMAIL = 'kevin@beispiel.de';

let devOwner: ReturnType<typeof ensureUser> | undefined;

export const handle: Handle = async ({ event, resolve }) => {
	devOwner ??= ensureUser(db, DEV_OWNER_EMAIL);
	event.locals.owner = await devOwner;
	return resolve(event);
};
