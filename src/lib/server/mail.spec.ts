import { describe, expect, it, vi } from 'vitest';
import { sendLoginMail } from './mail';

const mail = { to: 'kevin@beispiel.de', link: 'https://example.test/anmelden/abc' };

describe('sendLoginMail', () => {
	it('schreibt ohne API-Schlüssel nur ins Log', async () => {
		const log = vi.spyOn(console, 'info').mockImplementation(() => {});
		const fetchFn = vi.fn();
		await sendLoginMail({ apiKey: undefined, from: 'x' }, mail, fetchFn);
		expect(fetchFn).not.toHaveBeenCalled();
		expect(log).toHaveBeenCalledWith(expect.stringContaining(mail.link));
		log.mockRestore();
	});

	it('schickt mit API-Schlüssel über Resend', async () => {
		const fetchFn = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
		await sendLoginMail({ apiKey: 're_test', from: 'SW <a@b.de>' }, mail, fetchFn);

		const [url, init] = fetchFn.mock.calls[0];
		expect(url).toBe('https://api.resend.com/emails');
		expect(init.headers.Authorization).toBe('Bearer re_test');
		const body = JSON.parse(init.body);
		expect(body).toMatchObject({ from: 'SW <a@b.de>', to: ['kevin@beispiel.de'] });
		expect(body.text).toContain(mail.link);
	});

	it('meldet Fehler von Resend', async () => {
		const fetchFn = vi.fn().mockResolvedValue(new Response('domain not verified', { status: 403 }));
		await expect(sendLoginMail({ apiKey: 're_test', from: 'x' }, mail, fetchFn)).rejects.toThrow(
			'403'
		);
	});
});
