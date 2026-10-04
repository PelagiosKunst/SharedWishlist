import { expect, test, type Browser } from '@playwright/test';
import { addIdea, login, open } from '../../e2e/helpers';

async function guestPage(browser: Browser, shareUrl: string, name: string) {
	const context = await browser.newContext({ locale: 'de-DE' });
	const page = await context.newPage();
	await open(page, shareUrl);
	await page.getByLabel('Wie heißt du?').fill(name);
	await page.getByRole('button', { name: 'Zur Liste' }).click();
	return page;
}

test('Teilen, Namen eintragen, reservieren und Spoilerschutz', async ({ page: owner, browser }) => {
	// Besitzer*in legt Liste an.
	await login(owner);
	await open(owner, '/liste/ueber-mich');
	await owner.getByLabel('Name der Liste').fill('Kevins Wunschliste');
	await owner.getByLabel('Stell dich kurz vor').fill('Ich koche gern.');
	await owner.getByRole('button', { name: 'Speichern' }).click();
	await expect(owner).toHaveURL(/\/liste$/);
	await addIdea(owner, { title: 'Bräter', price: '89,90', priority: 'Wichtig' });
	await addIdea(owner, { title: 'Distelfink' });
	const shareUrl = await owner.getByRole('textbox', { name: 'Teilen-Link' }).inputValue();

	// Anna tritt bei und reserviert.
	const anna = await guestPage(browser, shareUrl, 'Anna');
	await expect(anna.getByRole('heading', { level: 1 })).toHaveText('Kevins Wunschliste');
	await expect(anna.getByText('Du bist Anna')).toBeVisible();
	await expect(anna.getByRole('region', { name: 'Worüber ich mich freue' })).toContainText(
		'Ich koche gern.'
	);
	await expect(anna.getByText('Die Liste enthält nur Ideen.')).toBeVisible();
	const annaBraeter = anna.getByRole('article').filter({ hasText: 'Bräter' });
	await annaBraeter.getByRole('button', { name: 'Reservieren' }).click();
	await expect(annaBraeter.getByText('Von dir reserviert')).toBeVisible();

	// Ein zweites „anna“ muss einen Zusatz wählen.
	const jonasContext = await browser.newContext({ locale: 'de-DE' });
	const second = await jonasContext.newPage();
	await open(second, shareUrl);
	await second.getByLabel('Wie heißt du?').fill(' anna ');
	await second.getByRole('button', { name: 'Zur Liste' }).click();
	await expect(second.getByRole('alert')).toContainText('schon vergeben');
	await second.getByLabel('Wie heißt du?').fill('Anna M.');
	await second.getByRole('button', { name: 'Zur Liste' }).click();
	await expect(second.getByText('Du bist Anna M.')).toBeVisible();

	// Anna M. sieht die Reservierung und kann sie nicht übernehmen.
	const secondBraeter = second.getByRole('article').filter({ hasText: 'Bräter' });
	await expect(secondBraeter.getByText('Reserviert von Anna')).toBeVisible();
	await expect(secondBraeter.getByRole('button', { name: 'Reservieren' })).toHaveCount(0);
	await expect(second.getByText('2 Ideen · 1 noch frei')).toBeVisible();

	// Spoilerschutz: ohne Schalter erfährt die Besitzerin oder der Besitzer nichts.
	await open(owner, '/liste');
	await expect(owner.getByText('Reserviert von')).toHaveCount(0);
	await expect(owner.locator('body')).not.toContainText('Anna');
	await owner.getByRole('link', { name: 'Reservierungen zeigen (Spoiler)' }).click();
	await expect(
		owner.getByRole('article').filter({ hasText: 'Bräter' }).getByText('Reserviert von Anna')
	).toBeVisible();
	await expect(
		owner.getByRole('article').filter({ hasText: 'Distelfink' }).getByText('Noch frei')
	).toBeVisible();

	// Wer die eigene Liste über den Teilen-Link öffnet, landet in der eigenen Ansicht.
	await open(owner, shareUrl);
	await expect(owner).toHaveURL(/\/liste$/);

	// Gekauft lässt sich nicht mehr zurücknehmen.
	await anna.reload();
	await annaBraeter.getByRole('button', { name: 'Gekauft' }).click();
	await expect(annaBraeter.getByText('Von dir gekauft')).toBeVisible();
	await expect(annaBraeter.getByRole('button', { name: 'Zurücknehmen' })).toHaveCount(0);

	// Persönlicher Link: Anna macht auf einem zweiten Gerät weiter.
	await anna.getByRole('button', { name: 'Auf anderem Gerät öffnen' }).click();
	const personalLink = await anna.getByLabel('Persönlicher Link').inputValue();
	const annaPhone = await (await browser.newContext({ locale: 'de-DE' })).newPage();
	await open(annaPhone, personalLink);
	await annaPhone.getByRole('button', { name: 'Ja, als Anna weitermachen' }).click();
	await expect(annaPhone.getByText('Du bist Anna')).toBeVisible();
	await expect(
		annaPhone.getByRole('article').filter({ hasText: 'Bräter' }).getByText('Von dir gekauft')
	).toBeVisible();

	// Neuer Teilen-Link: der alte öffnet nichts mehr, bekannte Geräte bleiben drin.
	await open(owner, '/liste');
	await owner.getByRole('button', { name: 'Neuen Link erzeugen' }).click();
	await owner.getByRole('button', { name: 'Alten Link wirklich ungültig machen?' }).click();
	await expect(owner.getByRole('textbox', { name: 'Teilen-Link' })).not.toHaveValue(shareUrl);
	const stranger = await (await browser.newContext()).newPage();
	const response = await stranger.goto(shareUrl);
	expect(response?.status()).toBe(404);
	await expect(stranger.getByText('nicht (mehr) gültig')).toBeVisible();
});
