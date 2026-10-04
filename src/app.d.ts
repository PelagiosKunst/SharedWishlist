// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { User } from '#lib/server/db/schema.ts';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			/** Angemeldete Besitzerin oder angemeldeter Besitzer. In M1 immer die feste Test-Person. */
			owner: User | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
