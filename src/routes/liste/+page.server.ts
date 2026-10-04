import { fail } from '@sveltejs/kit';
import { db } from '#lib/server/db/index.ts';
import { reservationsForList } from '#lib/server/guests.ts';
import { deleteWish, listWishes, regenerateShareToken } from '#lib/server/lists.ts';
import { requireOwnList } from '#lib/server/owner.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const list = await requireOwnList(locals);
	const wishes = await listWishes(db, list.id);

	// Spoilerschutz: Reservierungen verlassen den Server nur, wenn der Schalter bewusst an ist.
	const spoilers = url.searchParams.get('spoiler') === '1';
	const reservations = spoilers ? await reservationsForList(db, list.id) : null;

	return {
		list,
		shareUrl: new URL(`/l/${list.shareToken}`, url.origin).href,
		email: locals.owner?.email ?? '',
		spoilers,
		wishes: wishes.map((wish) => {
			const r = reservations?.get(wish.id);
			return {
				...wish,
				reservation: r ? { guestName: r.guestName, bought: r.bought } : null
			};
		})
	};
};

export const actions: Actions = {
	delete: async ({ locals, request }) => {
		const list = await requireOwnList(locals);
		const id = (await request.formData()).get('id');
		if (typeof id !== 'string' || !(await deleteWish(db, list.id, id))) {
			return fail(404, { message: 'Diese Idee gibt es nicht mehr.' });
		}
		return { deleted: true };
	},
	regenerateShare: async ({ locals }) => {
		const list = await requireOwnList(locals);
		await regenerateShareToken(db, list.id);
		return { regenerated: true };
	}
};
