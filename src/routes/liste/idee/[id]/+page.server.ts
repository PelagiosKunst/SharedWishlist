import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '#lib/server/db/index.ts';
import { getWish, listWishes, updateWish } from '#lib/server/lists.ts';
import { requireOwnList } from '#lib/server/owner.ts';
import { categoriesOf, parseWishForm, priceInputValue } from '#lib/wishes.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const list = await requireOwnList(locals);
	const wish = await getWish(db, list.id, params.id);
	if (!wish) error(404, 'Diese Idee gibt es nicht.');
	return {
		values: {
			title: wish.title,
			url: wish.url,
			price: priceInputValue(wish.priceCents),
			category: wish.category,
			priority: wish.priority,
			note: wish.note
		},
		categories: categoriesOf(await listWishes(db, list.id))
	};
};

export const actions: Actions = {
	default: async ({ locals, params, request }) => {
		const list = await requireOwnList(locals);
		const result = parseWishForm(await request.formData());
		if (!result.ok) return fail(400, { errors: result.errors, values: result.values });
		if (!(await updateWish(db, list.id, params.id, result.data))) {
			error(404, 'Diese Idee gibt es nicht.');
		}
		redirect(303, '/liste');
	}
};
