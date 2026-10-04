import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { GiftStyle, Priority } from '../../wishes';

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

export type User = typeof user.$inferSelect;
export type List = typeof list.$inferSelect;
export type Wish = typeof wish.$inferSelect;
