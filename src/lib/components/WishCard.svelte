<script lang="ts">
	import type { Snippet } from 'svelte';
	import { PRIORITY_LABELS, formatPrice, shopHost, type Priority } from '#lib/wishes.ts';

	type Props = {
		wish: {
			title: string;
			url: string;
			priceCents: number | null;
			category: string;
			priority: Priority;
			note: string;
		};
		actions?: Snippet;
	};

	let { wish, actions }: Props = $props();
	const host = $derived(wish.url ? shopHost(wish.url) : '');
</script>

<article class="card">
	<div class="meta">
		<span>{wish.category || 'Ohne Kategorie'}</span>
		<span class:top={wish.priority === 'top'}>{PRIORITY_LABELS[wish.priority]}</span>
	</div>
	<h3>{wish.title}</h3>
	{#if wish.note}
		<p class="note">{wish.note}</p>
	{/if}
	<div class="foot">
		{#if wish.priceCents !== null || host}
			<div class="row">
				{#if wish.priceCents !== null}
					<span class="price">{formatPrice(wish.priceCents)}</span>
				{/if}
				{#if host}
					<a class="shop" href={wish.url} target="_blank" rel="noopener noreferrer">{host} ↗</a>
				{/if}
			</div>
		{/if}
		{#if actions}
			<div class="row">{@render actions()}</div>
		{/if}
	</div>
</article>

<style>
	.card {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 8px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		min-width: 0;
	}
	.meta {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 10px;
		font-family: var(--f-mono);
		font-size: 11px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.meta span {
		min-width: 0;
		overflow-wrap: anywhere;
	}
	.top {
		color: var(--accent);
	}
	h3 {
		font-weight: 600;
		font-size: 1.22rem;
		line-height: 1.2;
	}
	.note {
		margin: 0;
		color: var(--muted);
		overflow-wrap: anywhere;
	}
	.foot {
		margin-top: auto;
		padding-top: 6px;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		min-width: 0;
	}
	/* Preis als Geschenkanhänger */
	.price {
		position: relative;
		display: inline-block;
		font-family: var(--f-mono);
		font-size: 13px;
		font-variant-numeric: tabular-nums;
		background: var(--chip);
		padding: 4px 11px 4px 20px;
		clip-path: polygon(11px 0, 100% 0, 100% 100%, 11px 100%, 0 50%);
	}
	.price::before {
		content: '';
		position: absolute;
		left: 9px;
		top: 50%;
		width: 5px;
		height: 5px;
		margin-top: -2.5px;
		border-radius: 50%;
		background: var(--surface);
	}
	.shop {
		font-size: 13px;
		font-weight: 600;
		text-decoration: none;
		overflow-wrap: anywhere;
	}
	.shop:hover {
		text-decoration: underline;
	}
</style>
