import { fail, redirect } from '@sveltejs/kit';
import { consumeLoginToken, createSession } from '#lib/server/auth.ts';
import { setSessionCookie } from '#lib/server/cookies.ts';
import { db } from '#lib/server/db/index.ts';
import type { Actions } from './$types';

// Der Link aus der Mail öffnet nur eine Seite mit Knopf. Eingelöst wird erst per POST,
// damit Link-Vorschauen und Virenscanner in Mailprogrammen den Einmal-Link nicht verbrauchen.
export const actions: Actions = {
	default: async ({ params, cookies }) => {
		const user = await consumeLoginToken(db, params.token);
		if (!user) return fail(400, { invalid: true });
		const session = await createSession(db, user.id);
		setSessionCookie(cookies, session.token, session.expiresAt);
		redirect(303, '/liste');
	}
};
