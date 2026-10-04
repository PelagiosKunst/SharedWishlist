import { defineEnvVars } from '@sveltejs/kit/env';

const optional = (value: string | undefined) => value || undefined;

export const variables = defineEnvVars({
	DATABASE_URL: { description: 'The database connection string.' },
	RESEND_API_KEY: {
		description:
			'API-Schlüssel für Resend. Ohne Schlüssel werden Anmeldelinks nur im Server-Log ausgegeben.',
		schema: optional
	},
	MAIL_FROM: {
		description: 'Absender der Anmelde-Mails, z. B. "SharedWishlist <login@deine-domain.de>".',
		schema: (value) => value || 'SharedWishlist <onboarding@resend.dev>'
	},
	LOGIN_LINK_ON_PAGE: {
		description:
			'Nur für Tests: "1" zeigt den Anmeldelink direkt auf der Seite. Wird ignoriert, sobald RESEND_API_KEY gesetzt ist.',
		schema: (value) => value === '1'
	}
});
