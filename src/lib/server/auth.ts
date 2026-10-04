import { and, eq, gt, isNull } from 'drizzle-orm';
import { loginToken, session, type User } from './db/schema';
import { ensureUser, getOrCreateList, type Db } from './lists';
import { hashToken, newToken } from './tokens';

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

export const LOGIN_TOKEN_TTL = 15 * MINUTE;
export const SESSION_TTL = 30 * DAY;
/** Sitzungen, die weniger als 15 Tage übrig haben, werden bei Nutzung verlängert. */
const SESSION_RENEW_BELOW = 15 * DAY;
/** Höchstens so viele Anmeldelinks pro E-Mail-Adresse innerhalb von 15 Minuten. */
export const LOGIN_REQUESTS_PER_WINDOW = 3;

export const SESSION_COOKIE = 'session';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(input: string): string | undefined {
	const email = input.trim().toLowerCase();
	return EMAIL_RE.test(email) && email.length <= 254 ? email : undefined;
}

export type LoginRequest = { ok: true; token: string } | { ok: false; reason: 'rate_limited' };

/** Erzeugt einen Einmal-Link für die Anmeldung. Der Klartext-Token geht nur in die Mail. */
export async function requestLoginToken(
	db: Db,
	email: string,
	now = new Date()
): Promise<LoginRequest> {
	const recent = await db.query.loginToken.findMany({
		where: and(
			eq(loginToken.email, email),
			gt(loginToken.createdAt, new Date(now.getTime() - LOGIN_TOKEN_TTL))
		),
		columns: { tokenHash: true }
	});
	if (recent.length >= LOGIN_REQUESTS_PER_WINDOW) return { ok: false, reason: 'rate_limited' };

	const token = newToken();
	await db.insert(loginToken).values({
		tokenHash: hashToken(token),
		email,
		createdAt: now,
		expiresAt: new Date(now.getTime() + LOGIN_TOKEN_TTL)
	});
	return { ok: true, token };
}

/**
 * Löst einen Anmeldelink ein: nur einmal und nur innerhalb von 15 Minuten.
 * Beim ersten Mal entstehen Person und leere Liste.
 */
export async function consumeLoginToken(
	db: Db,
	token: string,
	now = new Date()
): Promise<User | undefined> {
	const [used] = await db
		.update(loginToken)
		.set({ usedAt: now })
		.where(
			and(
				eq(loginToken.tokenHash, hashToken(token)),
				isNull(loginToken.usedAt),
				gt(loginToken.expiresAt, now)
			)
		)
		.returning({ email: loginToken.email });
	if (!used) return undefined;

	const user = await ensureUser(db, used.email);
	await getOrCreateList(db, user.id);
	return user;
}

export async function createSession(
	db: Db,
	userId: string,
	now = new Date()
): Promise<{ token: string; expiresAt: Date }> {
	const token = newToken();
	const expiresAt = new Date(now.getTime() + SESSION_TTL);
	await db.insert(session).values({ tokenHash: hashToken(token), userId, expiresAt });
	return { token, expiresAt };
}

/** Prüft eine Sitzung und verlängert sie, wenn sie bald abläuft. */
export async function validateSession(
	db: Db,
	token: string,
	now = new Date()
): Promise<{ user: User; expiresAt: Date; renewed: boolean } | undefined> {
	const tokenHash = hashToken(token);
	const found = await db.query.session.findFirst({
		where: eq(session.tokenHash, tokenHash),
		with: { user: true }
	});
	if (!found) return undefined;
	if (found.expiresAt.getTime() <= now.getTime()) {
		await db.delete(session).where(eq(session.tokenHash, tokenHash));
		return undefined;
	}
	if (found.expiresAt.getTime() - now.getTime() < SESSION_RENEW_BELOW) {
		const expiresAt = new Date(now.getTime() + SESSION_TTL);
		await db.update(session).set({ expiresAt }).where(eq(session.tokenHash, tokenHash));
		return { user: found.user, expiresAt, renewed: true };
	}
	return { user: found.user, expiresAt: found.expiresAt, renewed: false };
}

export async function deleteSession(db: Db, token: string): Promise<void> {
	await db.delete(session).where(eq(session.tokenHash, hashToken(token)));
}
