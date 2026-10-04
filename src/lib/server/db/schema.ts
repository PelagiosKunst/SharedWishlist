import { relations, sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import type { GiftStyle, Priority } from '../../wishes';
import { newToken } from '../tokens';

const id = () =>
	text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
	integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch('subsec') * 1000)`);

export const user = sqliteTable('user', {
	id: id(),
	email: text('email').notNull().unique(),
	createdAt: createdAt()
});

/** Genau eine Liste pro Person: `owner_id` ist eindeutig. */
export const list = sqliteTable('list', {
	id: id(),
	ownerId: text('owner_id')
		.notNull()
		.unique()
		.references(() => user.id, { onDelete: 'cascade' }),
	title: text('title').notNull().default(''),
	intro: text('intro').notNull().default(''),
	currentFocus: text('current_focus').notNull().default(''),
	giftStyles: text('gift_styles', { mode: 'json' }).$type<GiftStyle[]>().notNull().default([]),
	sizes: text('sizes').notNull().default(''),
	nogos: text('nogos').notNull().default(''),
	/**
	 * Geheimnis im Teilen-Link `/l/<share_token>`. Im Klartext, weil die Besitzerin oder der
	 * Besitzer den Link jederzeit wieder kopieren können soll. Ältere Listen bekommen ihn beim
	 * nächsten Laden (`getOrCreateList`).
	 */
	shareToken: text('share_token')
		.unique()
		.$defaultFn(() => newToken()),
	createdAt: createdAt()
});

export const session = sqliteTable('session', {
	tokenHash: text('token_hash').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
	createdAt: createdAt()
});

/** Einmal-Links für die Anmeldung. Die Person entsteht erst, wenn der Link eingelöst wird. */
export const loginToken = sqliteTable(
	'login_token',
	{
		tokenHash: text('token_hash').primaryKey(),
		email: text('email').notNull(),
		expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
		usedAt: integer('used_at', { mode: 'timestamp_ms' }),
		createdAt: createdAt()
	},
	(t) => [index('login_token_email_idx').on(t.email)]
);

/** Schenkende: kein Konto, nur ein Name, eindeutig pro Liste. */
export const guest = sqliteTable(
	'guest',
	{
		id: id(),
		listId: text('list_id')
			.notNull()
			.references(() => list.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		/** Name in Kleinbuchstaben ohne Leerzeichen am Rand, für die Eindeutigkeit. */
		nameKey: text('name_key').notNull(),
		/** Persönlicher Link für ein weiteres Gerät. Wird bei jedem Abruf neu erzeugt. */
		recoveryTokenHash: text('recovery_token_hash').unique(),
		createdAt: createdAt()
	},
	(t) => [uniqueIndex('guest_list_name_idx').on(t.listId, t.nameKey)]
);

export const guestDevice = sqliteTable('guest_device', {
	tokenHash: text('token_hash').primaryKey(),
	guestId: text('guest_id')
		.notNull()
		.references(() => guest.id, { onDelete: 'cascade' }),
	createdAt: createdAt()
});

/** Höchstens eine Reservierung pro Idee: `wish_id` ist der Primärschlüssel. */
export const reservation = sqliteTable('reservation', {
	wishId: text('wish_id')
		.primaryKey()
		.references(() => wish.id, { onDelete: 'cascade' }),
	guestId: text('guest_id')
		.notNull()
		.references(() => guest.id, { onDelete: 'cascade' }),
	boughtAt: integer('bought_at', { mode: 'timestamp_ms' }),
	createdAt: createdAt()
});

export const wish = sqliteTable(
	'wish',
	{
		id: id(),
		listId: text('list_id')
			.notNull()
			.references(() => list.id, { onDelete: 'cascade' }),
		title: text('title').notNull(),
		url: text('url').notNull().default(''),
		/** Preis in Cent, damit Summen ohne Rundungsfehler bleiben. */
		priceCents: integer('price_cents'),
		category: text('category').notNull().default(''),
		priority: text('priority').$type<Priority>().notNull().default('gern'),
		note: text('note').notNull().default(''),
		createdAt: createdAt(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
	},
	(t) => [index('wish_list_idx').on(t.listId)]
);

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] })
}));

export const reservationRelations = relations(reservation, ({ one }) => ({
	guest: one(guest, { fields: [reservation.guestId], references: [guest.id] }),
	wish: one(wish, { fields: [reservation.wishId], references: [wish.id] })
}));

export const guestDeviceRelations = relations(guestDevice, ({ one }) => ({
	guest: one(guest, { fields: [guestDevice.guestId], references: [guest.id] })
}));

export type User = typeof user.$inferSelect;
export type List = typeof list.$inferSelect;
export type Wish = typeof wish.$inferSelect;
export type Guest = typeof guest.$inferSelect;
export type Reservation = typeof reservation.$inferSelect;
