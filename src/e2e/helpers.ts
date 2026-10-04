import { expect, type Page } from '@playwright/test';

let counter = 0;

/**
 * Öffnet eine Seite und wartet, bis Svelte hydriert ist. Vorher getippte Eingaben
 * würden beim Hydrieren sonst überschrieben.
 */
export async function open(page: Page, url: string): Promise<void> {
	await page.goto(url);
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
}

/** Eindeutige Adresse pro Test, damit jeder Test mit einer leeren Liste startet. */
export function uniqueEmail(name = 'kevin'): string {
	counter += 1;
	return `${name}+${Date.now()}-${counter}@beispiel.de`;
}

/**
 * Meldet per Magic Link an. Die E2E-Umgebung setzt LOGIN_LINK_ON_PAGE=1,
 * daher steht der Link direkt auf der Seite statt in einer Mail.
 */
export async function login(page: Page, email = uniqueEmail()): Promise<string> {
	await open(page, '/anmelden');
	await page.getByLabel('E-Mail-Adresse').fill(email);
	await page.getByRole('button', { name: 'Anmeldelink schicken' }).click();
	await expect(page.getByRole('heading', { name: 'Schau in dein Postfach' })).toBeVisible();
	await page.getByRole('link', { name: 'Anmeldelink öffnen' }).click();
	await page.getByRole('button', { name: 'Jetzt anmelden' }).click();
	await expect(page).toHaveURL(/\/liste$/);
	return email;
}

export async function addIdea(
	page: Page,
	idea: { title: string; price?: string; priority?: 'Wichtig' | 'Gern' | 'Irgendwann' }
): Promise<void> {
	await open(page, '/liste/idee/neu');
	await page.getByLabel('Was ist die Idee?').fill(idea.title);
	if (idea.price) await page.getByLabel('Preis in Euro').fill(idea.price);
	if (idea.priority) {
		await page
			.getByLabel('Wie sehr freust du dich darüber?')
			.selectOption({ label: idea.priority });
	}
	await page.getByRole('button', { name: 'Idee speichern' }).click();
	await expect(page).toHaveURL(/\/liste$/);
}
