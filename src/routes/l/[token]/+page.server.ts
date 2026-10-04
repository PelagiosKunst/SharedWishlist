import { error, fail, redirect, type Cookies } from '@sveltejs/kit';
import { setGuestCookie } from '#lib/server/cookies.ts';
import { db } from '#lib/server/db/index.ts';
import {
	createRecoveryToken,
	guestCookieName,
	guestForDevice,
	joinList,
	markBought,
	release,
	reservationsForList,
	reserve
} from '#lib/server/guests.ts';
import { findListByShareToken, listWishes } from '#lib/server/lists.ts';
import type { Actions, PageServerLoad } from './$types';

async function listForLink(token: string, owner: App.Locals['owner']) {
	const list = await findListByShareToken(db, token);
	if (!list) {
		error(404, 'Dieser Link ist nicht (mehr) gültig. Frag die Person nach dem aktuellen Link.');
	}
	// Spoilerschutz: Wer die eigene Liste über den Teilen-Link öffnet, landet in der eigenen Ansicht.
	if (owner && owner.id === list.ownerId) redirect(303, '/liste');
	return list;
}

async function currentGuest(cookies: Cookies, listId: string) {
	const deviceToken = cookies.get(guestCookieName(listId));
	return deviceToken ? guestForDevice(db, listId, deviceToken) : undefined;
}

async function requireGuest(params: { token: string }, locals: App.Locals, cookies: Cookies) {
	const list = await listForLink(params.token, locals.owner);
	const guest = await currentGuest(cookies, list.id);
	if (!guest) return { list, guest: undefined };
	return { list, guest };
}

function wishIdFrom(form: FormData): string {
	const id = form.get('wishId');
	return typeof id === 'string' ? id : '';
}

export const load: PageServerLoad = async ({ params, locals, cookies }) => {
	const list = await listForLink(params.token, locals.owner);
	const about = {
		title: list.title || 'Wunschliste',
		intro: list.intro,
		currentFocus: list.currentFocus,
		giftStyles: list.giftStyles,
		sizes: list.sizes,
		nogos: list.nogos
	};

	const guest = await currentGuest(cookies, list.id);
	if (!guest) return { joined: false as const, about };

	const [wishes, reservations] = await Promise.all([
		listWishes(db, list.id),
		reservationsForList(db, list.id)
	]);
	return {
		joined: true as const,
		about,
		me: guest.name,
		wishes: wishes.map((w) => {
			const r = reservations.get(w.id);
			return {
				id: w.id,
				title: w.title,
				url: w.url,
				priceCents: w.priceCents,
				category: w.category,
				priority: w.priority,
				note: w.note,
				reservation: r
					? { guestName: r.guestName, mine: r.guestId === guest.id, bought: r.bought }
					: null
			};
		})
	};
};

export const actions: Actions = {
	join: async ({ params, locals, cookies, request }) => {
		const list = await listForLink(params.token, locals.owner);
		const result = await joinList(
			db,
			list.id,
			String((await request.formData()).get('name') ?? '')
		);
		if (!result.ok) {
			const message =
				result.reason === 'taken'
					? `„${result.name}“ ist auf dieser Liste schon vergeben. Ergänze etwas, z. B. „${result.name} M.“ oder „${result.name} (Kollegin)“.`
					: 'Bitte gib deinen Namen ein (höchstens 40 Zeichen).';
			return fail(400, { joinError: message, name: result.name });
		}
		setGuestCookie(cookies, list.id, result.deviceToken);
		redirect(303, `/l/${params.token}`);
	},

	reserve: async ({ params, locals, cookies, request }) => {
		const { list, guest } = await requireGuest(params, locals, cookies);
		if (!guest) return fail(401, { message: 'Trag zuerst deinen Namen ein.' });
		const result = await reserve(db, list.id, guest.id, wishIdFrom(await request.formData()));
		if (result === 'taken')
			return fail(409, { message: 'Das hat gerade jemand anderes reserviert.' });
		if (result === 'not_found') return fail(404, { message: 'Diese Idee gibt es nicht mehr.' });
		return { reserved: true };
	},

	release: async ({ params, locals, cookies, request }) => {
		const { guest } = await requireGuest(params, locals, cookies);
		if (!guest) return fail(401, { message: 'Trag zuerst deinen Namen ein.' });
		if (!(await release(db, guest.id, wishIdFrom(await request.formData())))) {
			return fail(409, { message: 'Diese Reservierung kannst du nicht mehr zurücknehmen.' });
		}
		return { released: true };
	},

	bought: async ({ params, locals, cookies, request }) => {
		const { guest } = await requireGuest(params, locals, cookies);
		if (!guest) return fail(401, { message: 'Trag zuerst deinen Namen ein.' });
		if (!(await markBought(db, guest.id, wishIdFrom(await request.formData())))) {
			return fail(409, { message: 'Das hat nicht geklappt. Lade die Seite neu.' });
		}
		return { bought: true };
	},

	personalLink: async ({ params, locals, cookies, url }) => {
		const { guest } = await requireGuest(params, locals, cookies);
		if (!guest) return fail(401, { message: 'Trag zuerst deinen Namen ein.' });
		const token = await createRecoveryToken(db, guest.id);
		return { personalLink: new URL(`/l/${params.token}/g/${token}`, url.origin).href };
	}
};
