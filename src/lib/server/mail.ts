export type MailConfig = {
	apiKey: string | undefined;
	from: string;
};

export type LoginMail = { to: string; link: string };

export function loginMailContent(link: string): { subject: string; text: string; html: string } {
	const text = [
		'Hallo!',
		'',
		'Mit diesem Link meldest du dich bei SharedWishlist an:',
		link,
		'',
		'Der Link gilt 15 Minuten und funktioniert einmal.',
		'Wenn du dich nicht anmelden wolltest, kannst du diese Mail ignorieren.'
	].join('\n');
	const html = `<p>Hallo!</p>
<p>Mit diesem Link meldest du dich bei SharedWishlist an:</p>
<p><a href="${link}" style="display:inline-block;padding:10px 16px;background:#1e5b57;color:#ffffff;border-radius:6px;text-decoration:none;font-weight:600">Jetzt anmelden</a></p>
<p style="color:#5a6962">Der Link gilt 15 Minuten und funktioniert einmal. Wenn du dich nicht anmelden wolltest, kannst du diese Mail ignorieren.</p>`;
	return { subject: 'Dein Anmeldelink für SharedWishlist', text, html };
}

/**
 * Verschickt den Anmeldelink über die Resend-API. Ohne API-Schlüssel (Entwicklung)
 * landet der Link nur im Server-Log.
 */
export async function sendLoginMail(
	config: MailConfig,
	mail: LoginMail,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	if (!config.apiKey) {
		console.info(`[mail] Anmeldelink für ${mail.to}: ${mail.link}`);
		return;
	}
	const content = loginMailContent(mail.link);
	const response = await fetchFn('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${config.apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ from: config.from, to: [mail.to], ...content })
	});
	if (!response.ok) {
		throw new Error(`Resend antwortet mit ${response.status}: ${await response.text()}`);
	}
}
