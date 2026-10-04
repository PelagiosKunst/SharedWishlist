import { expect, test } from '@playwright/test';
import { login, open } from '../../e2e/helpers';

test('ohne Anmeldung geht es zur Anmeldeseite', async ({ page }) => {
	await open(page, '/liste');
	await expect(page).toHaveURL(/\/anmelden$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Deine Wunschliste');
});

test('neue Personen starten mit einer leeren Liste', async ({ page }) => {
	await login(page);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Meine Wunschliste');
	await expect(page.getByRole('link', { name: 'Über mich schreiben' })).toBeVisible();
	await expect(page.getByRole('textbox', { name: 'Teilen-Link' })).toHaveValue(/\/l\/[\w-]{20,}$/);
});

test('„Über mich“ ausfüllen', async ({ page }) => {
	await login(page);
	await page.getByRole('link', { name: 'Über mich schreiben' }).click();

	await page.getByLabel('Name der Liste').fill('Kevins Wunschliste');
	await page.getByLabel('Stell dich kurz vor').fill('Ich koche gern für Freunde.');
	await page.getByLabel('Was beschäftigt dich gerade?').fill('Umzug im Frühjahr');
	await page.getByLabel('Erlebnisse').check();
	await page.getByLabel('Selbstgemachtes').check();
	await page.getByLabel('Bitte nicht').fill('Duftkerzen');
	await page.getByRole('button', { name: 'Speichern' }).click();

	await expect(page).toHaveURL(/\/liste$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kevins Wunschliste');
	const about = page.getByRole('region', { name: 'Über mich' });
	await expect(about).toContainText('Ich koche gern für Freunde.');
	await expect(about).toContainText('Umzug im Frühjahr');
	await expect(about.getByRole('listitem')).toHaveText(['Erlebnisse', 'Selbstgemachtes']);
});

test('Idee anlegen, mit Fehlern korrigieren, bearbeiten und löschen', async ({ page }) => {
	await login(page);
	await page.getByRole('link', { name: '+ Idee hinzufügen' }).click();

	// Fehler werden am Feld angezeigt, Eingaben bleiben erhalten.
	await page.getByLabel('Preis in Euro').fill('zehn Euro');
	await page.getByRole('button', { name: 'Idee speichern' }).click();
	await expect(page.getByText('Gib der Idee einen Namen.')).toBeVisible();
	await expect(page.getByText('Gib den Preis als Zahl ein')).toBeVisible();
	await expect(page.getByLabel('Preis in Euro')).toHaveValue('zehn Euro');

	await page.getByLabel('Was ist die Idee?').fill('Gusseisen-Bräter, 28 cm');
	await page.getByLabel('Link zum Shop').fill('manufactum.de/braeter');
	await page.getByLabel('Preis in Euro').fill('89,90');
	await page.getByLabel('Kategorie').fill('Küche');
	await page.getByLabel('Wie sehr freust du dich darüber?').selectOption({ label: 'Wichtig' });
	await page.getByRole('button', { name: 'Idee speichern' }).click();

	await expect(page).toHaveURL(/\/liste$/);
	const card = page.getByRole('article').filter({ hasText: 'Gusseisen-Bräter' });
	await expect(card).toContainText('89,90');
	await expect(card).toContainText('Wichtig');
	await expect(card.getByRole('link', { name: /manufactum\.de/ })).toHaveAttribute(
		'href',
		'https://manufactum.de/braeter'
	);
	await expect(page.getByText('1 Idee', { exact: true })).toBeVisible();

	await card.getByRole('link', { name: 'Bearbeiten' }).click();
	await expect(page.getByLabel('Preis in Euro')).toHaveValue('89,90');
	await page.getByLabel('Was ist die Idee?').fill('Gusseisen-Bräter, 24 cm');
	await page.getByRole('button', { name: 'Änderung speichern' }).click();
	const edited = page.getByRole('article').filter({ hasText: 'Gusseisen-Bräter, 24 cm' });
	await expect(edited).toBeVisible();

	// Löschen braucht zwei Klicks.
	await edited.getByRole('button', { name: 'Löschen' }).click();
	await expect(edited).toBeVisible();
	await edited.getByRole('button', { name: 'Wirklich löschen?' }).click();
	await expect(page.getByRole('article')).toHaveCount(0);
	await expect(page.getByText('Noch keine Ideen').first()).toBeVisible();
});

test('abmelden', async ({ page }) => {
	await login(page);
	await page.getByRole('button', { name: 'Abmelden' }).click();
	await expect(page).toHaveURL(/\/anmelden$/);
	await open(page, '/liste');
	await expect(page).toHaveURL(/\/anmelden$/);
});

test('Eingaben bleiben nach einem vollen Seitenaufruf erhalten, wenn man weitertippt', async ({
	page
}) => {
	// Regression: Tippen in der Vorstellung hat nach der Hydrierung den Listennamen gelöscht.
	await login(page);
	await open(page, '/liste/ueber-mich');
	await page.getByLabel('Name der Liste').fill('Kevins Wunschliste');
	await page.getByLabel('Stell dich kurz vor').fill('Ich koche gern.');
	await expect(page.getByLabel('Name der Liste')).toHaveValue('Kevins Wunschliste');
	await expect(page.getByText('15 / 280')).toBeVisible();
});
