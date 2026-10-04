import { and, eq } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './db/schema';
import { compareWishes, type AboutInput, type WishInput } from '../wishes';
import { newToken } from './tokens';

export type Db = LibSQLDatabase<typeof schema>;

const { user, list, wish } = schema;

/** Legt die Person an, falls es sie noch nicht gibt. E-Mail-Adressen werden kleingeschrieben verglichen. */
export async function ensureUser(db: Db, email: string): Promise<schema.User> {
	const normalized = email.trim().toLowerCase();
	await db.insert(user).values({ email: normalized }).onConflictDoNothing();
	const found = await db.query.user.findFirst({ where: eq(user.email, normalized) });
	if (!found) throw new Error(`User ${normalized} could not be created`);
	return found;
}

/** Jede Person hat genau eine Liste. Beim ersten Aufruf wird sie leer angelegt. */
export async function getOrCreateList(db: Db, ownerId: string): Promise<schema.List> {
	await db.insert(list).values({ ownerId }).onConflictDoNothing();
	const found = await db.query.list.findFirst({ where: eq(list.ownerId, ownerId) });
	if (!found) throw new Error(`List for ${ownerId} could not be created`);
	if (!found.shareToken) {
		// Listen aus M1 haben noch keinen Teilen-Link.
		return { ...found, shareToken: await regenerateShareToken(db, found.id) };
	}
	return found;
}

/** Neuer Teilen-Link. Der alte öffnet die Liste danach nicht mehr; bekannte Geräte bleiben angemeldet. */
export async function regenerateShareToken(db: Db, listId: string): Promise<string> {
	const shareToken = newToken();
	await db.update(list).set({ shareToken }).where(eq(list.id, listId));
	return shareToken;
}

export async function findListByShareToken(
	db: Db,
	shareToken: string
): Promise<schema.List | undefined> {
	return db.query.list.findFirst({ where: eq(list.shareToken, shareToken) });
}

export async function updateAbout(db: Db, listId: string, input: AboutInput): Promise<void> {
	await db.update(list).set(input).where(eq(list.id, listId));
}

export async function listWishes(db: Db, listId: string): Promise<schema.Wish[]> {
	const rows = await db.query.wish.findMany({ where: eq(wish.listId, listId) });
	return rows.sort(compareWishes);
}

/** Liefert die Idee nur, wenn sie zu dieser Liste gehört. */
export async function getWish(
	db: Db,
	listId: string,
	wishId: string
): Promise<schema.Wish | undefined> {
	return db.query.wish.findFirst({ where: and(eq(wish.id, wishId), eq(wish.listId, listId)) });
}

export async function createWish(db: Db, listId: string, input: WishInput): Promise<schema.Wish> {
	const [created] = await db
		.insert(wish)
		.values({ ...input, listId })
		.returning();
	return created;
}

/** Gibt `false` zurück, wenn die Idee nicht (mehr) zu dieser Liste gehört. */
export async function updateWish(
	db: Db,
	listId: string,
	wishId: string,
	input: WishInput
): Promise<boolean> {
	const updated = await db
		.update(wish)
		.set({ ...input, updatedAt: new Date() })
		.where(and(eq(wish.id, wishId), eq(wish.listId, listId)))
		.returning({ id: wish.id });
	return updated.length > 0;
}

export async function deleteWish(db: Db, listId: string, wishId: string): Promise<boolean> {
	const deleted = await db
		.delete(wish)
		.where(and(eq(wish.id, wishId), eq(wish.listId, listId)))
		.returning({ id: wish.id });
	return deleted.length > 0;
}
