/**
 * Fachregeln für Ideen (im Code `wish`) und „Über mich“.
 * Rein und ohne Abhängigkeiten, damit Server und Browser dieselbe Prüfung nutzen.
 */

export const PRIORITIES = ['top', 'gern', 'spaeter'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
	top: 'Wichtig',
	gern: 'Gern',
	spaeter: 'Irgendwann'
};

export const GIFT_STYLES = [
	'erlebnisse',
	'praktisches',
	'ueberraschungen',
	'selbstgemachtes',
	'gutscheine'
] as const;
export type GiftStyle = (typeof GIFT_STYLES)[number];

export const GIFT_STYLE_LABELS: Record<GiftStyle, string> = {
	erlebnisse: 'Erlebnisse',
	praktisches: 'Praktisches',
	ueberraschungen: 'Überraschungen',
	selbstgemachtes: 'Selbstgemachtes',
	gutscheine: 'Gutscheine'
};

export const LIMITS = {
	title: 120,
	url: 500,
	category: 40,
	note: 400,
	listTitle: 80,
	intro: 280,
	currentFocus: 160,
	sizes: 300,
	nogos: 200
} as const;

/** Höchster Preis, den wir annehmen: 100.000 €. Schützt vor Tippfehlern wie „4990000“. */
const MAX_PRICE_CENTS = 10_000_000;

export type FieldErrors<K extends string> = Partial<Record<K, string>>;
export type ParseResult<T, K extends string> =
	{ ok: true; data: T } | { ok: false; errors: FieldErrors<K>; values: Record<K, string> };

/**
 * Liest einen Preis wie „49,90“, „49.90“, „1.299,00 €“ oder „15“ und gibt Cent zurück.
 * Leere Eingabe ergibt `null`, ungültige Eingabe `undefined`.
 */
export function parsePriceCents(input: string): number | null | undefined {
	let s = input.replace(/[€\s]/g, '');
	if (s === '') return null;
	if (s.includes(',')) {
		// Deutsche Schreibweise: Punkte sind Tausendertrenner, Komma ist das Dezimalzeichen.
		s = s.replace(/\./g, '').replace(',', '.');
	} else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
		// „1.299“ ohne Komma ist ein Tausenderpunkt.
		s = s.replace(/\./g, '');
	}
	if (!/^\d+(\.\d{1,2})?$/.test(s)) return undefined;
	const cents = Math.round(Number(s) * 100);
	return cents <= MAX_PRICE_CENTS ? cents : undefined;
}

const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

export function formatPrice(cents: number): string {
	return euro.format(cents / 100);
}

/** Preis für ein Eingabefeld, z. B. 4990 → „49,90“. */
export function priceInputValue(cents: number | null): string {
	return cents === null ? '' : (cents / 100).toFixed(2).replace('.', ',');
}

/** Ergänzt fehlendes https:// und lässt nur http(s)-Links zu. Ungültig ergibt `undefined`. */
export function normalizeUrl(input: string): string | undefined {
	const raw = input.trim();
	if (raw === '') return '';
	try {
		const url = new URL(raw.includes('://') ? raw : `https://${raw}`);
		if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined;
		if (!url.hostname.includes('.')) return undefined;
		return url.href;
	} catch {
		return undefined;
	}
}

export function shopHost(url: string): string {
	try {
		return new URL(url).hostname.replace(/^www\./, '');
	} catch {
		return '';
	}
}

function field(form: FormData, name: string): string {
	const v = form.get(name);
	return typeof v === 'string' ? v.trim() : '';
}

function tooLong<K extends string>(
	errors: FieldErrors<K>,
	key: K,
	value: string,
	max: number
): void {
	if (value.length > max) errors[key] = `Bitte höchstens ${max} Zeichen.`;
}

export type WishInput = {
	title: string;
	url: string;
	priceCents: number | null;
	category: string;
	priority: Priority;
	note: string;
};
type WishField = 'title' | 'url' | 'price' | 'category' | 'priority' | 'note';

export function parseWishForm(form: FormData): ParseResult<WishInput, WishField> {
	const values = {
		title: field(form, 'title'),
		url: field(form, 'url'),
		price: field(form, 'price'),
		category: field(form, 'category'),
		priority: field(form, 'priority'),
		note: field(form, 'note')
	};
	const errors: FieldErrors<WishField> = {};

	if (!values.title) errors.title = 'Gib der Idee einen Namen.';
	tooLong(errors, 'title', values.title, LIMITS.title);

	const url = normalizeUrl(values.url);
	if (url === undefined || url.length > LIMITS.url) {
		errors.url = 'Der Link sieht nicht richtig aus, z. B. https://shop.de/artikel.';
	}

	const priceCents = parsePriceCents(values.price);
	if (priceCents === undefined) errors.price = 'Gib den Preis als Zahl ein, z. B. 49,90.';

	tooLong(errors, 'category', values.category, LIMITS.category);
	tooLong(errors, 'note', values.note, LIMITS.note);

	const priority = (PRIORITIES as readonly string[]).includes(values.priority)
		? (values.priority as Priority)
		: undefined;
	if (!priority) errors.priority = 'Wähle aus, wie wichtig dir die Idee ist.';

	if (
		Object.keys(errors).length > 0 ||
		!priority ||
		url === undefined ||
		priceCents === undefined
	) {
		return { ok: false, errors, values };
	}
	return {
		ok: true,
		data: {
			title: values.title,
			url,
			priceCents,
			category: values.category,
			priority,
			note: values.note
		}
	};
}

export type AboutInput = {
	title: string;
	intro: string;
	currentFocus: string;
	giftStyles: GiftStyle[];
	sizes: string;
	nogos: string;
};
type AboutField = 'title' | 'intro' | 'currentFocus' | 'sizes' | 'nogos';

export function parseAboutForm(form: FormData): ParseResult<AboutInput, AboutField> {
	const values = {
		title: field(form, 'title'),
		intro: field(form, 'intro'),
		currentFocus: field(form, 'currentFocus'),
		sizes: field(form, 'sizes'),
		nogos: field(form, 'nogos')
	};
	const errors: FieldErrors<AboutField> = {};
	tooLong(errors, 'title', values.title, LIMITS.listTitle);
	tooLong(errors, 'intro', values.intro, LIMITS.intro);
	tooLong(errors, 'currentFocus', values.currentFocus, LIMITS.currentFocus);
	tooLong(errors, 'sizes', values.sizes, LIMITS.sizes);
	tooLong(errors, 'nogos', values.nogos, LIMITS.nogos);

	const giftStyles = GIFT_STYLES.filter((s) => form.getAll('giftStyles').includes(s));

	if (Object.keys(errors).length > 0) return { ok: false, errors, values };
	return { ok: true, data: { ...values, giftStyles } };
}

/** Alle verwendeten Kategorien, alphabetisch, für Vorschläge im Formular. */
export function categoriesOf(wishes: { category: string }[]): string[] {
	return [...new Set(wishes.map((w) => w.category).filter(Boolean))].sort((a, b) =>
		a.localeCompare(b, 'de')
	);
}

/** Reihenfolge der Liste: erst nach Wichtigkeit, innerhalb davon die neuesten zuerst. */
export function compareWishes(
	a: { priority: Priority; createdAt: Date },
	b: { priority: Priority; createdAt: Date }
): number {
	return (
		PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority) ||
		b.createdAt.getTime() - a.createdAt.getTime()
	);
}
