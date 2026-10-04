<script lang="ts">
	import { enhance } from '$app/forms';
	import AboutPanel from '#lib/components/AboutPanel.svelte';
	import ShareBox from '#lib/components/ShareBox.svelte';
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

<div class="account">
	<span class="hint">Angemeldet als {data.email}</span>
	<form method="post" action="/abmelden">
		<button class="linkbtn" type="submit">Abmelden</button>
	</form>
</div>

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

<ShareBox url={data.shareUrl} />

<div class="bar">
	<h2>Ideen</h2>
	<div class="bar-actions">
		{#if count > 0}
			<a
				class="chip"
				class:on={data.spoilers}
				href={data.spoilers ? '/liste' : '/liste?spoiler=1'}
				title="Zeigt, was schon reserviert ist. Das kann Überraschungen verraten."
				data-sveltekit-noscroll
			>
				{data.spoilers ? 'Reservierungen ausblenden' : 'Reservierungen zeigen (Spoiler)'}
			</a>
		{/if}
		<a class="btn btn-primary" href="/liste/idee/neu">+ Idee hinzufügen</a>
	</div>
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
					{#if data.spoilers}
						{#if wish.reservation}
							<span class="pill pill-reserved">
								{wish.reservation.bought ? 'Gekauft von' : 'Reserviert von'}
								{wish.reservation.guestName}
							</span>
						{:else}
							<span class="pill pill-free">Noch frei</span>
						{/if}
					{/if}
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
	.account {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		align-items: baseline;
		gap: 4px 12px;
	}
	.linkbtn {
		font: inherit;
		font-size: 14px;
		background: none;
		border: 0;
		padding: 0;
		color: var(--accent);
		text-decoration: underline;
		cursor: pointer;
	}
	.bar-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	}
	.chip {
		font-size: 13px;
		font-weight: 500;
		padding: 7px 13px;
		border-radius: 999px;
		border: 1px solid var(--line);
		color: var(--ink);
		text-decoration: none;
	}
	.chip.on {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--accent-ink);
	}
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
