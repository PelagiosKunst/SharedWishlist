import { createHash, randomBytes } from 'node:crypto';

/** Zufälliges, URL-taugliches Geheimnis mit 160 Bit. */
export function newToken(): string {
	return randomBytes(20).toString('base64url');
}

/**
 * Geheimnisse (Login-, Sitzungs- und Geräte-Tokens) speichern wir nur als SHA-256.
 * Wer die Datenbank liest, kann sich damit nicht anmelden.
 */
export function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}
