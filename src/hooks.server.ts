import type { Handle } from '@sveltejs/kit/hooks';
import { SESSION_COOKIE, validateSession } from '#lib/server/auth.ts';
import { clearSessionCookie, setSessionCookie } from '#lib/server/cookies.ts';
import { db } from '#lib/server/db/index.ts';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.owner = null;

	const token = event.cookies.get(SESSION_COOKIE);
	if (token) {
		const session = await validateSession(db, token);
		if (session) {
			event.locals.owner = session.user;
			if (session.renewed) setSessionCookie(event.cookies, token, session.expiresAt);
		} else {
			clearSessionCookie(event.cookies);
		}
	}

	return resolve(event);
};
