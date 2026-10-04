import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import WishCard from './WishCard.svelte';

const base = {
	title: 'Gusseisen-Bräter',
	url: '',
	priceCents: null,
	category: '',
	priority: 'gern' as const,
	note: ''
};

describe('WishCard.svelte', () => {
	it('zeigt Preis, Wichtigkeit und Shop', async () => {
		render(WishCard, {
			wish: { ...base, priceCents: 8990, priority: 'top', url: 'https://www.manufactum.de/x' }
		});

		await expect
			.element(page.getByRole('heading', { level: 3 }))
			.toHaveTextContent('Gusseisen-Bräter');
		await expect.element(page.getByText('89,90')).toBeInTheDocument();
		await expect.element(page.getByText('Wichtig')).toBeInTheDocument();
		await expect
			.element(page.getByRole('link', { name: /manufactum\.de/ }))
			.toHaveAttribute('rel', 'noopener noreferrer');
	});

	it('kommt ohne Preis, Link und Kategorie aus', async () => {
		render(WishCard, { wish: base });

		await expect.element(page.getByText('Ohne Kategorie')).toBeInTheDocument();
		await expect.element(page.getByRole('link')).not.toBeInTheDocument();
	});
});
