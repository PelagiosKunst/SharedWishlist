import { fail, redirect } from '@sveltejs/kit';
import { LOGIN_LINK_ON_PAGE, MAIL_FROM, RESEND_API_KEY } from '$app/env/private';
import { normalizeEmail, requestLoginToken } from '#lib/server/auth.ts';
import { db } from '#lib/server/db/index.ts';
import { sendLoginMail } from '#lib/server/mail.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.owner) redirect(303, '/liste');
};

export const actions: Actions = {
	default: async ({ request, url }) => {
		const raw = String((await request.formData()).get('email') ?? '');
		const email = normalizeEmail(raw);
		if (!email) {
			return fail(400, { email: raw, error: 'Bitte gib eine gültige E-Mail-Adresse ein.' });
		}

		const result = await requestLoginToken(db, email);
		if (!result.ok) {
			return fail(429, {
				email,
				error:
					'Du hast gerade schon mehrere Links angefordert. Schau in dein Postfach oder versuch es in 15 Minuten noch einmal.'
			});
		}

		const link = new URL(`/anmelden/${result.token}`, url.origin).href;
		try {
			await sendLoginMail({ apiKey: RESEND_API_KEY, from: MAIL_FROM }, { to: email, link });
		} catch (e) {
			console.error('[mail]', e);
			return fail(502, {
				email,
				error:
					'Die Mail konnte gerade nicht verschickt werden. Versuch es in ein paar Minuten noch einmal.'
			});
		}

		// Nur für Entwicklung und automatische Tests: Den Link auf der Seite zu zeigen hieße auf
		// einem echten Server, dass sich jeder als jeder anmelden kann. Deshalb dreifach abgesichert.
		const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
		const testLink = LOGIN_LINK_ON_PAGE && !RESEND_API_KEY && local ? link : undefined;
		return { sent: true, email, testLink };
	}
};
