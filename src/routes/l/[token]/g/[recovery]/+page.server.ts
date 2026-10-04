import { error, fail, redirect } from '@sveltejs/kit';
import { setGuestCookie } from '#lib/server/cookies.ts';
import { db } from '#lib/server/db/index.ts';
import { findGuestByRecovery, redeemRecovery } from '#lib/server/guests.ts';
import { findListByShareToken } from '#lib/server/lists.ts';
import type { Actions, PageServerLoad } from './$types';

async function listFor(token: string) {
	const list = await findListByShareToken(db, token);
	if (!list) error(404, 'Dieser Link ist nicht (mehr) gültig.');
	return list;
}

export const load: PageServerLoad = async ({ params }) => {
	const list = await listFor(params.token);
	const guest = await findGuestByRecovery(db, list.id, params.recovery);
	return { title: list.title || 'Wunschliste', name: guest?.name ?? null };
};

// Übernommen wird erst per Knopfdruck, damit Link-Vorschauen nichts auslösen.
export const actions: Actions = {
	default: async ({ params, cookies }) => {
		const list = await listFor(params.token);
		const redeemed = await redeemRecovery(db, list.id, params.recovery);
		if (!redeemed) return fail(400, { invalid: true });
		setGuestCookie(cookies, list.id, redeemed.deviceToken);
		redirect(303, `/l/${params.token}`);
	}
};
