import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE, deleteSession } from '#lib/server/auth.ts';
import { clearSessionCookie } from '#lib/server/cookies.ts';
import { db } from '#lib/server/db/index.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	redirect(303, '/liste');
};

export const actions: Actions = {
	default: async ({ cookies }) => {
		const token = cookies.get(SESSION_COOKIE);
		if (token) await deleteSession(db, token);
		clearSessionCookie(cookies);
		redirect(303, '/anmelden');
	}
};
