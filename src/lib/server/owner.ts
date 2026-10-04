import { error } from '@sveltejs/kit';
import { db } from './db';
import { getOrCreateList } from './lists';

/** Liste der angemeldeten Person. Ohne Anmeldung gibt es keinen Zugriff. */
export async function requireOwnList(locals: App.Locals) {
	if (!locals.owner) error(401, 'Bitte melde dich an.');
	return getOrCreateList(db, locals.owner.id);
}
