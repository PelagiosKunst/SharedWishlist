import { redirect } from '@sveltejs/kit';
import { db } from './db';
import { getOrCreateList } from './lists';

/** Liste der angemeldeten Person. Ohne Anmeldung geht es zur Anmeldeseite. */
export async function requireOwnList(locals: App.Locals) {
	if (!locals.owner) redirect(303, '/anmelden');
	return getOrCreateList(db, locals.owner.id);
}
