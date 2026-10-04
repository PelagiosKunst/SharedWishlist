import { fail } from '@sveltejs/kit';
import { db } from '#lib/server/db/index.ts';
import { deleteWish, listWishes } from '#lib/server/lists.ts';
import { requireOwnList } from '#lib/server/owner.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const list = await requireOwnList(locals);
	return { list, wishes: await listWishes(db, list.id) };
};

export const actions: Actions = {
	delete: async ({ locals, request }) => {
		const list = await requireOwnList(locals);
		const id = (await request.formData()).get('id');
		if (typeof id !== 'string' || !(await deleteWish(db, list.id, id))) {
			return fail(404, { message: 'Diese Idee gibt es nicht mehr.' });
		}
		return { deleted: true };
	}
};
