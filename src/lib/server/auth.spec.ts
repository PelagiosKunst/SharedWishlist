import { beforeEach, describe, expect, it } from 'vitest';
import {
	LOGIN_REQUESTS_PER_WINDOW,
	LOGIN_TOKEN_TTL,
	SESSION_TTL,
	consumeLoginToken,
	createSession,
	deleteSession,
	normalizeEmail,
	requestLoginToken,
	validateSession
} from './auth';
import { getOrCreateList, type Db } from './lists';
import { createTestDb } from './test-db';

const DAY = 24 * 60 * 60_000;
const t0 = new Date('2026-10-04T10:00:00Z');
const later = (ms: number) => new Date(t0.getTime() + ms);

let db: Db;
beforeEach(async () => {
	db = await createTestDb();
});

describe('normalizeEmail', () => {
	it('macht Adressen vergleichbar', () => {
		expect(normalizeEmail('  Kevin@Beispiel.DE ')).toBe('kevin@beispiel.de');
	});

	it.each(['', 'kevin', 'kevin@', '@beispiel.de', 'a b@c.de'])('lehnt „%s“ ab', (input) => {
		expect(normalizeEmail(input)).toBeUndefined();
	});
});

describe('Anmeldelink', () => {
	it('meldet beim ersten Mal an und legt Person und Liste an', async () => {
		const req = await requestLoginToken(db, 'kevin@beispiel.de', t0);
		if (!req.ok) throw new Error('unerwartet begrenzt');
		const user = await consumeLoginToken(db, req.token, later(60_000));
		expect(user?.email).toBe('kevin@beispiel.de');
		const list = await getOrCreateList(db, user!.id);
		expect(list.shareToken).toMatch(/^[\w-]{20,}$/);
	});

	it('funktioniert nur einmal', async () => {
		const req = await requestLoginToken(db, 'kevin@beispiel.de', t0);
		if (!req.ok) throw new Error('unerwartet begrenzt');
		expect(await consumeLoginToken(db, req.token, t0)).toBeDefined();
		expect(await consumeLoginToken(db, req.token, t0)).toBeUndefined();
	});

	it('läuft nach 15 Minuten ab', async () => {
		const req = await requestLoginToken(db, 'kevin@beispiel.de', t0);
		if (!req.ok) throw new Error('unerwartet begrenzt');
		expect(await consumeLoginToken(db, req.token, later(LOGIN_TOKEN_TTL + 1))).toBeUndefined();
	});

	it('kennt keine erfundenen Tokens', async () => {
		expect(await consumeLoginToken(db, 'ausgedacht', t0)).toBeUndefined();
	});

	it('begrenzt Anfragen pro Adresse und gibt nach dem Zeitfenster wieder frei', async () => {
		for (let i = 0; i < LOGIN_REQUESTS_PER_WINDOW; i++) {
			expect((await requestLoginToken(db, 'kevin@beispiel.de', t0)).ok).toBe(true);
		}
		expect(await requestLoginToken(db, 'kevin@beispiel.de', later(60_000))).toEqual({
			ok: false,
			reason: 'rate_limited'
		});
		expect((await requestLoginToken(db, 'anna@beispiel.de', t0)).ok).toBe(true);
		expect((await requestLoginToken(db, 'kevin@beispiel.de', later(LOGIN_TOKEN_TTL + 1))).ok).toBe(
			true
		);
	});
});

describe('Sitzungen', () => {
	async function login() {
		const req = await requestLoginToken(db, 'kevin@beispiel.de', t0);
		if (!req.ok) throw new Error('unerwartet begrenzt');
		const user = (await consumeLoginToken(db, req.token, t0))!;
		return { user, ...(await createSession(db, user.id, t0)) };
	}

	it('erkennt die Person an ihrem Sitzungs-Token', async () => {
		const { user, token } = await login();
		const result = await validateSession(db, token, later(DAY));
		expect(result?.user.id).toBe(user.id);
		expect(result?.renewed).toBe(false);
	});

	it('verlängert Sitzungen, die bald ablaufen', async () => {
		const { token } = await login();
		const now = later(20 * DAY);
		const result = await validateSession(db, token, now);
		expect(result?.renewed).toBe(true);
		expect(result?.expiresAt.getTime()).toBe(now.getTime() + SESSION_TTL);
	});

	it('verwirft abgelaufene Sitzungen', async () => {
		const { token } = await login();
		expect(await validateSession(db, token, later(SESSION_TTL + 1))).toBeUndefined();
		expect(await validateSession(db, token, t0)).toBeUndefined();
	});

	it('meldet ab', async () => {
		const { token } = await login();
		await deleteSession(db, token);
		expect(await validateSession(db, token, t0)).toBeUndefined();
	});
});
