import { fail, redirect } from '@sveltejs/kit';
import { db } from '#lib/server/db/index.ts';
import { updateAbout } from '#lib/server/lists.ts';
import { requireOwnList } from '#lib/server/owner.ts';
import { parseAboutForm } from '#lib/wishes.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	return { list: await requireOwnList(locals) };
};

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const list = await requireOwnList(locals);
		const form = await request.formData();
		const result = parseAboutForm(form);
		if (!result.ok) {
			return fail(400, {
				errors: result.errors,
				values: result.values,
				giftStyles: form.getAll('giftStyles').map(String)
			});
		}
		await updateAbout(db, list.id, result.data);
		redirect(303, '/liste');
	}
};
