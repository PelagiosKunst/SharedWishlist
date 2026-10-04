import { describe, expect, it } from 'vitest';
import {
	compareWishes,
	formatPrice,
	normalizeUrl,
	parseAboutForm,
	parsePriceCents,
	parseWishForm,
	priceInputValue
} from './wishes';

function form(values: Record<string, string | string[]>): FormData {
	const fd = new FormData();
	for (const [k, v] of Object.entries(values)) {
		for (const item of Array.isArray(v) ? v : [v]) fd.append(k, item);
	}
	return fd;
}

describe('parsePriceCents', () => {
	it.each([
		['49,90', 4990],
		['49.90', 4990],
		['15', 1500],
		['15 €', 1500],
		['1.299,00 €', 129900],
		['1.299', 129900],
		['0,5', 50]
	])('liest „%s“ als %i Cent', (input, cents) => {
		expect(parsePriceCents(input)).toBe(cents);
	});

	it('gibt null für leere Eingabe zurück', () => {
		expect(parsePriceCents('  ')).toBeNull();
	});

	it.each(['abc', '-5', '12,345', '1,2,3', '200000'])('lehnt „%s“ ab', (input) => {
		expect(parsePriceCents(input)).toBeUndefined();
	});
});

describe('Preisformat', () => {
	it('formatiert Cent als Euro', () => {
		expect(formatPrice(4990).replace(/\s/g, ' ')).toBe('49,90 €');
	});

	it('füllt Eingabefelder mit Komma', () => {
		expect(priceInputValue(4990)).toBe('49,90');
		expect(priceInputValue(null)).toBe('');
	});
});

describe('normalizeUrl', () => {
	it('ergänzt https://', () => {
		expect(normalizeUrl('shop.de/artikel')).toBe('https://shop.de/artikel');
	});

	it('lässt leere Eingabe zu', () => {
		expect(normalizeUrl('')).toBe('');
	});

	it.each(['javascript:alert(1)', 'ftp://shop.de', 'kein link'])('lehnt „%s“ ab', (input) => {
		expect(normalizeUrl(input)).toBeUndefined();
	});
});

describe('parseWishForm', () => {
	it('liest eine vollständige Idee', () => {
		const result = parseWishForm(
			form({
				title: ' Gusseisen-Bräter ',
				url: 'manufactum.de/braeter',
				price: '89,90',
				category: 'Küche',
				priority: 'top',
				note: 'Dunkelblau'
			})
		);
		expect(result).toEqual({
			ok: true,
			data: {
				title: 'Gusseisen-Bräter',
				url: 'https://manufactum.de/braeter',
				priceCents: 8990,
				category: 'Küche',
				priority: 'top',
				note: 'Dunkelblau'
			}
		});
	});

	it('meldet alle Fehler auf einmal und behält die Eingaben', () => {
		const result = parseWishForm(
			form({ title: '', url: 'kein link', price: 'zehn', priority: 'x' })
		);
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(Object.keys(result.errors).sort()).toEqual(['price', 'priority', 'title', 'url']);
		expect(result.values.price).toBe('zehn');
	});

	it('begrenzt die Länge', () => {
		const result = parseWishForm(form({ title: 'x'.repeat(121), priority: 'gern' }));
		expect(result.ok).toBe(false);
	});
});

describe('parseAboutForm', () => {
	it('übernimmt nur bekannte Vorlieben in fester Reihenfolge', () => {
		const result = parseAboutForm(
			form({ intro: 'Ich koche gern.', giftStyles: ['selbstgemachtes', 'hack', 'erlebnisse'] })
		);
		expect(result.ok && result.data.giftStyles).toEqual(['erlebnisse', 'selbstgemachtes']);
	});

	it('lehnt zu lange Vorstellungen ab', () => {
		const result = parseAboutForm(form({ intro: 'x'.repeat(281) }));
		expect(result.ok).toBe(false);
	});
});

describe('compareWishes', () => {
	it('sortiert nach Wichtigkeit, dann neueste zuerst', () => {
		const items = [
			{ id: 'a', priority: 'gern' as const, createdAt: new Date(1) },
			{ id: 'b', priority: 'top' as const, createdAt: new Date(1) },
			{ id: 'c', priority: 'gern' as const, createdAt: new Date(2) },
			{ id: 'd', priority: 'spaeter' as const, createdAt: new Date(3) }
		];
		expect(items.sort(compareWishes).map((w) => w.id)).toEqual(['b', 'c', 'a', 'd']);
	});
});
