<script lang="ts">
	import { enhance } from '$app/forms';
	import AboutPanel from '#lib/components/AboutPanel.svelte';
	import WishCard from '#lib/components/WishCard.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	/** Löschen braucht zwei Klicks: Der erste schärft den Knopf, der zweite löscht. */
	let armed = $state<string | null>(null);

	const count = $derived(data.wishes.length);
	const title = $derived(data.list.title || 'Meine Wunschliste');
</script>

<svelte:head>
	<title>{title} · SharedWishlist</title>
</svelte:head>

<header class="mast">
	<p class="eyebrow">
		{count === 0 ? 'Noch keine Ideen' : `${count} ${count === 1 ? 'Idee' : 'Ideen'}`}
	</p>
	<h1>{title}</h1>
</header>

<AboutPanel
	heading="Über mich"
	intro={data.list.intro}
	currentFocus={data.list.currentFocus}
	giftStyles={data.list.giftStyles}
	sizes={data.list.sizes}
	nogos={data.list.nogos}
>
	{#snippet actions()}
		<a class="btn" href="/liste/ueber-mich">Bearbeiten</a>
	{/snippet}
	{#snippet empty()}
		<p class="hint">
			Erzähl kurz, was dich gerade beschäftigt und worüber du dich freust. Das hilft Schenkenden
			mehr als jede Liste.
		</p>
		<a class="btn btn-primary start" href="/liste/ueber-mich">Über mich schreiben</a>
	{/snippet}
</AboutPanel>

<div class="bar">
	<h2>Ideen</h2>
	<a class="btn btn-primary" href="/liste/idee/neu">+ Idee hinzufügen</a>
</div>

{#if form?.message}
	<p class="field-error" role="alert">{form.message}</p>
{/if}

{#if count === 0}
	<p class="empty">
		<strong>Noch keine Ideen</strong>
		Trag ein, was dir gefallen würde. Es sind nur Anregungen: Wer dir etwas schenkt, darf auch etwas ganz
		anderes aussuchen.
	</p>
{:else}
	<section class="grid" aria-label="Ideen">
		{#each data.wishes as wish (wish.id)}
			<WishCard {wish}>
				{#snippet actions()}
					<a class="btn" href="/liste/idee/{wish.id}">Bearbeiten</a>
					<form
						method="post"
						action="?/delete"
						use:enhance={({ cancel }) => {
							if (armed !== wish.id) {
								armed = wish.id;
								cancel();
								return;
							}
							armed = null;
						}}
					>
						<input type="hidden" name="id" value={wish.id} />
						<button class="btn btn-danger" class:armed={armed === wish.id} type="submit">
							{armed === wish.id ? 'Wirklich löschen?' : 'Löschen'}
						</button>
					</form>
				{/snippet}
			</WishCard>
		{/each}
	</section>
{/if}

<style>
	.mast {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	h1 {
		font-weight: 700;
		font-size: clamp(2.1rem, 7vw, 3.6rem);
		line-height: 1.02;
		letter-spacing: -0.025em;
	}
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-top: 8px;
	}
	.bar h2 {
		font-size: 1.4rem;
		font-weight: 650;
	}
	.start {
		align-self: flex-start;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
		gap: 14px;
	}
	.empty {
		margin: 0;
		border: 1px dashed var(--line);
		border-radius: 8px;
		padding: 28px 20px;
		color: var(--muted);
		max-width: 62ch;
	}
	.empty strong {
		display: block;
		color: var(--ink);
		font-family: var(--f-display);
		font-size: 1.15rem;
		margin-bottom: 4px;
	}
</style>
