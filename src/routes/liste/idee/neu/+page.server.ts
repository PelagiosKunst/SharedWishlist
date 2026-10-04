import { fail, redirect } from '@sveltejs/kit';
import { db } from '#lib/server/db/index.ts';
import { createWish, listWishes } from '#lib/server/lists.ts';
import { requireOwnList } from '#lib/server/owner.ts';
import { categoriesOf, parseWishForm } from '#lib/wishes.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const list = await requireOwnList(locals);
	return { categories: categoriesOf(await listWishes(db, list.id)) };
};

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const list = await requireOwnList(locals);
		const result = parseWishForm(await request.formData());
		if (!result.ok) return fail(400, { errors: result.errors, values: result.values });
		await createWish(db, list.id, result.data);
		redirect(303, '/liste');
	}
};
