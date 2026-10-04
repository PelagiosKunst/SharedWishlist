import { beforeEach, describe, expect, it } from 'vitest';
import {
	createRecoveryToken,
	guestForDevice,
	joinList,
	markBought,
	normalizeGuestName,
	redeemRecovery,
	release,
	reservationsForList,
	reserve
} from './guests';
import {
	createWish,
	deleteWish,
	ensureUser,
	findListByShareToken,
	getOrCreateList,
	regenerateShareToken,
	type Db
} from './lists';
import { createTestDb } from './test-db';

let db: Db;
let listId: string;
let otherListId: string;
let wishId: string;

beforeEach(async () => {
	db = await createTestDb();
	listId = (await getOrCreateList(db, (await ensureUser(db, 'kevin@beispiel.de')).id)).id;
	otherListId = (await getOrCreateList(db, (await ensureUser(db, 'lea@beispiel.de')).id)).id;
	wishId = (
		await createWish(db, listId, {
			title: 'Bräter',
			url: '',
			priceCents: null,
			category: '',
			priority: 'gern',
			note: ''
		})
	).id;
});

async function join(name: string, onList = listId) {
	const result = await joinList(db, onList, name);
	if (!result.ok) throw new Error(`${name}: ${result.reason}`);
	return result;
}

describe('normalizeGuestName', () => {
	it('räumt Leerzeichen auf und vergleicht ohne Großschreibung', () => {
		expect(normalizeGuestName('  Anna   M. ')).toEqual({ name: 'Anna M.', key: 'anna m.' });
	});

	it.each(['', '   ', 'x'.repeat(41)])('lehnt „%s“ ab', (input) => {
		expect(normalizeGuestName(input)).toBeUndefined();
	});
});

describe('Beitreten', () => {
	it('verlangt bei gleichem Namen einen Zusatz', async () => {
		await join('Anna');
		expect(await joinList(db, listId, ' anna ')).toEqual({
			ok: false,
			reason: 'taken',
			name: 'anna'
		});
		expect((await joinList(db, listId, 'Anna M.')).ok).toBe(true);
	});

	it('erlaubt denselben Namen auf einer anderen Liste', async () => {
		await join('Anna');
		expect((await joinList(db, otherListId, 'Anna')).ok).toBe(true);
	});

	it('erkennt das Gerät wieder, aber nur auf der eigenen Liste', async () => {
		const { guest, deviceToken } = await join('Anna');
		expect((await guestForDevice(db, listId, deviceToken))?.id).toBe(guest.id);
		expect(await guestForDevice(db, otherListId, deviceToken)).toBeUndefined();
		expect(await guestForDevice(db, listId, 'ausgedacht')).toBeUndefined();
	});

	it('übernimmt die Identität per persönlichem Link auf ein zweites Gerät', async () => {
		const { guest } = await join('Anna');
		const first = await createRecoveryToken(db, guest.id);
		const second = await createRecoveryToken(db, guest.id);

		expect(await redeemRecovery(db, listId, first)).toBeUndefined();
		expect(await redeemRecovery(db, otherListId, second)).toBeUndefined();

		const redeemed = await redeemRecovery(db, listId, second);
		expect(redeemed?.guest.id).toBe(guest.id);
		expect((await guestForDevice(db, listId, redeemed!.deviceToken))?.id).toBe(guest.id);
	});
});

describe('Teilen-Link', () => {
	it('findet die Liste nur über den aktuellen Link', async () => {
		const old = (await getOrCreateList(db, (await ensureUser(db, 'kevin@beispiel.de')).id))
			.shareToken!;
		expect((await findListByShareToken(db, old))?.id).toBe(listId);

		const fresh = await regenerateShareToken(db, listId);
		expect(fresh).not.toBe(old);
		expect(await findListByShareToken(db, old)).toBeUndefined();
		expect((await findListByShareToken(db, fresh))?.id).toBe(listId);
	});

	it('lässt bekannte Geräte nach einem neuen Link angemeldet', async () => {
		const { deviceToken } = await join('Anna');
		await regenerateShareToken(db, listId);
		expect(await guestForDevice(db, listId, deviceToken)).toBeDefined();
	});
});

describe('Reservieren', () => {
	it('erlaubt pro Idee nur eine Reservierung', async () => {
		const anna = await join('Anna');
		const jonas = await join('Jonas');
		expect(await reserve(db, listId, anna.guest.id, wishId)).toBe('ok');
		expect(await reserve(db, listId, jonas.guest.id, wishId)).toBe('taken');

		const view = await reservationsForList(db, listId);
		expect(view.get(wishId)).toEqual({ guestId: anna.guest.id, guestName: 'Anna', bought: false });
	});

	it('reserviert keine Ideen fremder Listen', async () => {
		const lea = await join('Lea', otherListId);
		expect(await reserve(db, otherListId, lea.guest.id, wishId)).toBe('not_found');
	});

	it('lässt nur die eigene Reservierung zurücknehmen', async () => {
		const anna = await join('Anna');
		const jonas = await join('Jonas');
		await reserve(db, listId, anna.guest.id, wishId);
		expect(await release(db, jonas.guest.id, wishId)).toBe(false);
		expect(await release(db, anna.guest.id, wishId)).toBe(true);
		expect((await reservationsForList(db, listId)).size).toBe(0);
	});

	it('hält gekaufte Geschenke fest', async () => {
		const anna = await join('Anna');
		await reserve(db, listId, anna.guest.id, wishId);
		expect(await markBought(db, anna.guest.id, wishId)).toBe(true);
		expect(await release(db, anna.guest.id, wishId)).toBe(false);
		expect((await reservationsForList(db, listId)).get(wishId)?.bought).toBe(true);
	});

	it('entfernt Reservierungen mit der Idee', async () => {
		const anna = await join('Anna');
		await reserve(db, listId, anna.guest.id, wishId);
		await deleteWish(db, listId, wishId);
		expect((await reservationsForList(db, listId)).size).toBe(0);
	});
});
