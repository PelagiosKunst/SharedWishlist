import type { Cookies } from '@sveltejs/kit';
import { SESSION_COOKIE } from './auth';
import { guestCookieName } from './guests';

/** Browser begrenzen Cookies auf höchstens 400 Tage. */
const GUEST_MAX_AGE = 400 * 24 * 60 * 60;

export function setSessionCookie(cookies: Cookies, token: string, expiresAt: Date): void {
	cookies.set(SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		expires: expiresAt
	});
}

export function clearSessionCookie(cookies: Cookies): void {
	cookies.delete(SESSION_COOKIE, { path: '/' });
}

export function setGuestCookie(cookies: Cookies, listId: string, deviceToken: string): void {
	cookies.set(guestCookieName(listId), deviceToken, {
		path: '/l',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: GUEST_MAX_AGE
	});
}
