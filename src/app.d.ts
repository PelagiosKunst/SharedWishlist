// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { User } from '#lib/server/db/schema.ts';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			/** Per Magic Link angemeldete Besitzerin oder angemeldeter Besitzer, sonst `null`. */
			owner: User | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
