import { and, eq, isNull } from 'drizzle-orm';
import { guest, guestDevice, reservation, wish, type Guest } from './db/schema';
import type { Db } from './lists';
import { hashToken, newToken } from './tokens';

export const GUEST_NAME_MAX = 40;

/** Ein Cookie pro Liste, damit dieselbe Person auf mehreren Listen schenken kann. */
export function guestCookieName(listId: string): string {
	return `guest_${listId}`;
}

/** „ Anna  M. “ → Anzeige „Anna M.“, Schlüssel „anna m.“ */
export function normalizeGuestName(input: string): { name: string; key: string } | undefined {
	const name = input.trim().replace(/\s+/g, ' ');
	if (name.length === 0 || name.length > GUEST_NAME_MAX) return undefined;
	return { name, key: name.toLocaleLowerCase('de-DE') };
}

export type JoinResult =
	| { ok: true; guest: Guest; deviceToken: string }
	| { ok: false; reason: 'invalid' | 'taken'; name: string };

export async function joinList(db: Db, listId: string, rawName: string): Promise<JoinResult> {
	const normalized = normalizeGuestName(rawName);
	if (!normalized) return { ok: false, reason: 'invalid', name: rawName.trim() };

	const [created] = await db
		.insert(guest)
		.values({ listId, name: normalized.name, nameKey: normalized.key })
		.onConflictDoNothing()
		.returning();
	if (!created) return { ok: false, reason: 'taken', name: normalized.name };

	return { ok: true, guest: created, deviceToken: await addDevice(db, created.id) };
}

async function addDevice(db: Db, guestId: string): Promise<string> {
	const token = newToken();
	await db.insert(guestDevice).values({ tokenHash: hashToken(token), guestId });
	return token;
}

/** Die Gast-Identität dieses Geräts, aber nur, wenn sie zu dieser Liste gehört. */
export async function guestForDevice(
	db: Db,
	listId: string,
	deviceToken: string
): Promise<Guest | undefined> {
	const device = await db.query.guestDevice.findFirst({
		where: eq(guestDevice.tokenHash, hashToken(deviceToken)),
		with: { guest: true }
	});
	return device?.guest.listId === listId ? device.guest : undefined;
}

/** Neuer persönlicher Link für ein weiteres Gerät. Ein älterer Link wird damit ungültig. */
export async function createRecoveryToken(db: Db, guestId: string): Promise<string> {
	const token = newToken();
	await db
		.update(guest)
		.set({ recoveryTokenHash: hashToken(token) })
		.where(eq(guest.id, guestId));
	return token;
}

export async function findGuestByRecovery(
	db: Db,
	listId: string,
	recoveryToken: string
): Promise<Guest | undefined> {
	return db.query.guest.findFirst({
		where: and(eq(guest.listId, listId), eq(guest.recoveryTokenHash, hashToken(recoveryToken)))
	});
}

/** Meldet dieses Gerät als die Person hinter dem persönlichen Link an. */
export async function redeemRecovery(
	db: Db,
	listId: string,
	recoveryToken: string
): Promise<{ guest: Guest; deviceToken: string } | undefined> {
	const found = await findGuestByRecovery(db, listId, recoveryToken);
	if (!found) return undefined;
	return { guest: found, deviceToken: await addDevice(db, found.id) };
}

export type ReserveResult = 'ok' | 'taken' | 'not_found';

/** Höchstens eine Reservierung pro Idee; bei gleichzeitigen Klicks gewinnt der erste. */
export async function reserve(
	db: Db,
	listId: string,
	guestId: string,
	wishId: string
): Promise<ReserveResult> {
	const target = await db.query.wish.findFirst({
		where: and(eq(wish.id, wishId), eq(wish.listId, listId)),
		columns: { id: true }
	});
	if (!target) return 'not_found';
	const inserted = await db
		.insert(reservation)
		.values({ wishId, guestId })
		.onConflictDoNothing()
		.returning({ wishId: reservation.wishId });
	return inserted.length > 0 ? 'ok' : 'taken';
}

/** Nur die eigene Reservierung und nur, solange sie nicht als gekauft markiert ist. */
export async function release(db: Db, guestId: string, wishId: string): Promise<boolean> {
	const deleted = await db
		.delete(reservation)
		.where(
			and(
				eq(reservation.wishId, wishId),
				eq(reservation.guestId, guestId),
				isNull(reservation.boughtAt)
			)
		)
		.returning({ wishId: reservation.wishId });
	return deleted.length > 0;
}

export async function markBought(
	db: Db,
	guestId: string,
	wishId: string,
	now = new Date()
): Promise<boolean> {
	const updated = await db
		.update(reservation)
		.set({ boughtAt: now })
		.where(
			and(
				eq(reservation.wishId, wishId),
				eq(reservation.guestId, guestId),
				isNull(reservation.boughtAt)
			)
		)
		.returning({ wishId: reservation.wishId });
	return updated.length > 0;
}

export type ReservationView = {
	guestId: string;
	guestName: string;
	bought: boolean;
};

/** Alle Reservierungen einer Liste mit den Namen der Schenkenden, nach Idee. */
export async function reservationsForList(
	db: Db,
	listId: string
): Promise<Map<string, ReservationView>> {
	const rows = await db
		.select({
			wishId: reservation.wishId,
			guestId: reservation.guestId,
			guestName: guest.name,
			boughtAt: reservation.boughtAt
		})
		.from(reservation)
		.innerJoin(guest, eq(guest.id, reservation.guestId))
		.where(eq(guest.listId, listId));
	return new Map(
		rows.map((r) => [
			r.wishId,
			{ guestId: r.guestId, guestName: r.guestName, bought: r.boughtAt !== null }
		])
	);
}
