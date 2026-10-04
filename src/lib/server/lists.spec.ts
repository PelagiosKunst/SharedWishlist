import { beforeEach, describe, expect, it } from 'vitest';
import { createTestDb } from './test-db';
import {
	createWish,
	deleteWish,
	ensureUser,
	getOrCreateList,
	getWish,
	listWishes,
	updateAbout,
	updateWish,
	type Db
} from './lists';
import type { WishInput } from '../wishes';

const idea = (overrides: Partial<WishInput> = {}): WishInput => ({
	title: 'Bräter',
	url: '',
	priceCents: 8990,
	category: 'Küche',
	priority: 'gern',
	note: '',
	...overrides
});

let db: Db;

beforeEach(async () => {
	db = await createTestDb();
});

describe('Personen und Listen', () => {
	it('legt eine Person nur einmal an, unabhängig von Großschreibung', async () => {
		const a = await ensureUser(db, 'Kevin@Beispiel.de');
		const b = await ensureUser(db, ' kevin@beispiel.de ');
		expect(b.id).toBe(a.id);
		expect(b.email).toBe('kevin@beispiel.de');
	});

	it('gibt jeder Person genau eine Liste', async () => {
		const owner = await ensureUser(db, 'kevin@beispiel.de');
		const first = await getOrCreateList(db, owner.id);
		const second = await getOrCreateList(db, owner.id);
		expect(second.id).toBe(first.id);
		expect(first.giftStyles).toEqual([]);
	});

	it('speichert „Über mich“', async () => {
		const owner = await ensureUser(db, 'kevin@beispiel.de');
		const l = await getOrCreateList(db, owner.id);
		await updateAbout(db, l.id, {
			title: 'Kevins Wunschliste',
			intro: 'Ich koche gern.',
			currentFocus: 'Umzug',
			giftStyles: ['erlebnisse'],
			sizes: 'L',
			nogos: 'Deko'
		});
		const saved = await getOrCreateList(db, owner.id);
		expect(saved).toMatchObject({ intro: 'Ich koche gern.', giftStyles: ['erlebnisse'] });
	});
});

describe('Ideen', () => {
	let listId: string;
	let otherListId: string;

	beforeEach(async () => {
		listId = (await getOrCreateList(db, (await ensureUser(db, 'a@beispiel.de')).id)).id;
		otherListId = (await getOrCreateList(db, (await ensureUser(db, 'b@beispiel.de')).id)).id;
	});

	it('legt Ideen an und sortiert sie nach Wichtigkeit', async () => {
		await createWish(db, listId, idea({ title: 'Buch', priority: 'spaeter' }));
		await createWish(db, listId, idea({ title: 'Bräter', priority: 'top' }));
		await createWish(db, otherListId, idea({ title: 'Fremd' }));
		const titles = (await listWishes(db, listId)).map((w) => w.title);
		expect(titles).toEqual(['Bräter', 'Buch']);
	});

	it('bearbeitet nur Ideen der eigenen Liste', async () => {
		const own = await createWish(db, listId, idea());
		expect(await updateWish(db, otherListId, own.id, idea({ title: 'Gekapert' }))).toBe(false);
		expect(await updateWish(db, listId, own.id, idea({ title: 'Neu' }))).toBe(true);
		const saved = await getWish(db, listId, own.id);
		expect(saved?.title).toBe('Neu');
		expect(saved?.updatedAt).toBeInstanceOf(Date);
		expect(await getWish(db, otherListId, own.id)).toBeUndefined();
	});

	it('löscht nur Ideen der eigenen Liste', async () => {
		const own = await createWish(db, listId, idea());
		expect(await deleteWish(db, otherListId, own.id)).toBe(false);
		expect(await deleteWish(db, listId, own.id)).toBe(true);
		expect(await listWishes(db, listId)).toEqual([]);
	});
});
