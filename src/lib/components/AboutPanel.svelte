<script lang="ts">
	import type { Snippet } from 'svelte';
	import { GIFT_STYLE_LABELS, type GiftStyle } from '#lib/wishes.ts';

	type Props = {
		heading: string;
		intro: string;
		currentFocus: string;
		giftStyles: GiftStyle[];
		sizes: string;
		nogos: string;
		actions?: Snippet;
		empty?: Snippet;
	};

	let { heading, intro, currentFocus, giftStyles, sizes, nogos, actions, empty }: Props = $props();

	const facts = $derived(
		[
			['Gerade', currentFocus],
			['Größen', sizes],
			['Bitte nicht', nogos]
		].filter(([, value]) => value)
	);
	const hasContent = $derived(Boolean(intro || facts.length || giftStyles.length));
</script>

<section class="about" aria-labelledby="about-heading">
	<div class="head">
		<h2 class="eyebrow" id="about-heading">{heading}</h2>
		{@render actions?.()}
	</div>

	{#if hasContent}
		{#if intro}
			<p class="intro">{intro}</p>
		{/if}
		{#if facts.length}
			<dl>
				{#each facts as [label, value] (label)}
					<dt>{label}</dt>
					<dd>{value}</dd>
				{/each}
			</dl>
		{/if}
		{#if giftStyles.length}
			<div class="styles">
				<span class="hint">Freut sich besonders über</span>
				<ul>
					{#each giftStyles as style (style)}
						<li>{GIFT_STYLE_LABELS[style]}</li>
					{/each}
				</ul>
			</div>
		{/if}
	{:else}
		{@render empty?.()}
	{/if}
</section>

<style>
	.about {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 8px;
		padding: 16px 18px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		min-width: 0;
	}
	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}
	h2.eyebrow {
		font-weight: 500;
	}
	.intro {
		margin: 0;
		max-width: 62ch;
		font-family: var(--f-display);
		font-weight: 500;
		font-size: 1.2rem;
		line-height: 1.35;
		overflow-wrap: anywhere;
	}
	dl {
		margin: 0;
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 4px 16px;
	}
	dt {
		font-family: var(--f-mono);
		font-size: 11px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
		padding-top: 3px;
	}
	dd {
		margin: 0;
		white-space: pre-line;
		overflow-wrap: anywhere;
		min-width: 0;
	}
	.styles {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	li {
		font-size: 13px;
		font-weight: 500;
		padding: 3px 11px;
		border-radius: 999px;
		background: var(--chip);
	}
</style>
