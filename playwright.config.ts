import { defineConfig } from '@playwright/test';

// E2E-Tests laufen gegen einen Produktions-Build mit eigener, frisch migrierter Datenbank.
const E2E_DB = 'e2e.db';

export default defineConfig({
	testMatch: '**/*.e2e.{ts,js}',
	fullyParallel: false,
	workers: 1,
	use: { locale: 'de-DE' },
	webServer: {
		command: [
			`node -e "require('fs').rmSync('${E2E_DB}', { force: true })"`,
			'pnpm run build',
			'pnpm run db:migrate',
			'pnpm run preview'
		].join(' && '),
		port: 4173,
		timeout: 180_000,
		// LOGIN_LINK_ON_PAGE zeigt den Anmeldelink auf der Seite, weil in Tests keine Mail verschickt wird.
		env: { DATABASE_URL: `file:${E2E_DB}`, LOGIN_LINK_ON_PAGE: '1' }
	}
});
