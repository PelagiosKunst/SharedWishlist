import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// M1: Die Startseite führt direkt zur eigenen Liste. In M2 kommt hier die Anmeldung hin.
export const load: PageServerLoad = () => {
	redirect(303, '/liste');
};
