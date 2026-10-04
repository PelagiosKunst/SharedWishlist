<script lang="ts">
	import { enhance } from '$app/forms';
	import AboutPanel from '#lib/components/AboutPanel.svelte';
	import WishCard from '#lib/components/WishCard.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const free = $derived(data.joined ? data.wishes.filter((w) => !w.reservation).length : 0);
	let copied = $state(false);

	async function copy(link: string) {
		try {
			await navigator.clipboard.writeText(link);
			copied = true;
		} catch {
			copied = false;
		}
	}
</script>

<svelte:head>
	<title>{data.about.title} · SharedWishlist</title>
	<meta name="robots" content="noindex" />
</svelte:head>

{#if !data.joined}
	<div class="center">
		<p class="eyebrow">Du bist eingeladen</p>
		<h1>{data.about.title}</h1>
		<p class="lead">
			Damit ihr euch absprechen könnt, sehen die anderen Schenkenden deinen Namen. Die Person, der
			die Liste gehört, sieht ihn nicht.
		</p>
		<form method="post" action="?/join" novalidate use:enhance>
			<label class="field" for="name">
				Wie heißt du?
				<input
					id="name"
					name="name"
					autocomplete="given-name"
					maxlength="40"
					required
					defaultValue={form && 'name' in form ? form.name : ''}
					aria-invalid={form && 'joinError' in form ? 'true' : undefined}
					aria-describedby={form && 'joinError' in form ? 'name-err' : undefined}
				/>
			</label>
			{#if form && 'joinError' in form}
				<p class="field-error" id="name-err" role="alert">{form.joinError}</p>
			{/if}
			<button class="btn btn-primary block" type="submit">Zur Liste</button>
		</form>
	</div>
{:else}
	<div class="who">
		<span class="hint">Du bist <strong>{data.me}</strong></span>
		<form
			method="post"
			action="?/personalLink"
			use:enhance={() =>
				async ({ update }) => {
					copied = false;
					await update({ reset: false });
				}}
		>
			<button class="btn" type="submit">Auf anderem Gerät öffnen</button>
		</form>
	</div>
	{#if form && 'personalLink' in form && form.personalLink}
		<div class="personal" role="status">
			<p class="hint">
				Öffne diesen Link auf deinem anderen Gerät, um dort als {data.me} weiterzumachen. Gib ihn nicht
				weiter: Wer ihn hat, kann in deinem Namen reservieren.
			</p>
			<input class="url" readonly value={form.personalLink} aria-label="Persönlicher Link" />
			<button class="btn" type="button" onclick={() => copy(form.personalLink)}>
				{copied ? 'Kopiert' : 'Link kopieren'}
			</button>
		</div>
	{/if}

	<header class="mast">
		<p class="eyebrow">
			{data.wishes.length}
			{data.wishes.length === 1 ? 'Idee' : 'Ideen'} · {free} noch frei
		</p>
		<h1>{data.about.title}</h1>
	</header>

	<AboutPanel
		heading="Worüber ich mich freue"
		intro={data.about.intro}
		currentFocus={data.about.currentFocus}
		giftStyles={data.about.giftStyles}
		sizes={data.about.sizes}
		nogos={data.about.nogos}
	/>

	<p class="ideas-note">
		Die Liste enthält nur Ideen. Wenn dir etwas anderes einfällt, das passt: nur zu.
	</p>

	{#if form && 'message' in form && form.message}
		<p class="field-error" role="alert">{form.message}</p>
	{/if}

	{#if data.wishes.length === 0}
		<p class="empty">
			<strong>Noch keine Ideen eingetragen</strong>
			Schau dir oben an, worüber sich die Person freut, oder komm später wieder.
		</p>
	{:else}
		<section class="grid" aria-label="Ideen">
			{#each data.wishes as wish (wish.id)}
				<div class:taken={wish.reservation && !wish.reservation.mine}>
					<WishCard {wish}>
						{#snippet actions()}
							{#if !wish.reservation}
								<form method="post" action="?/reserve" use:enhance>
									<input type="hidden" name="wishId" value={wish.id} />
									<button class="btn btn-primary" type="submit">Reservieren</button>
								</form>
							{:else if wish.reservation.mine}
								<span class="pill pill-mine">
									{wish.reservation.bought ? 'Von dir gekauft' : 'Von dir reserviert'}
								</span>
								{#if !wish.reservation.bought}
									<form method="post" action="?/bought" use:enhance>
										<input type="hidden" name="wishId" value={wish.id} />
										<button class="btn" type="submit">Gekauft</button>
									</form>
									<form method="post" action="?/release" use:enhance>
										<input type="hidden" name="wishId" value={wish.id} />
										<button class="btn" type="submit">Zurücknehmen</button>
									</form>
								{/if}
							{:else}
								<span class="pill pill-reserved">
									{wish.reservation.bought ? 'Gekauft von' : 'Reserviert von'}
									{wish.reservation.guestName}
								</span>
							{/if}
						{/snippet}
					</WishCard>
				</div>
			{/each}
		</section>
	{/if}
{/if}

<style>
	.center {
		max-width: 440px;
		margin: 6vh auto 0;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.center form {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.block {
		justify-content: center;
		padding: 11px 14px;
	}
	.lead {
		margin: 0;
		color: var(--muted);
	}
	.who {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}
	.personal {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
		padding: 12px 14px;
		border: 1px dashed var(--accent);
		border-radius: 8px;
		background: var(--surface);
	}
	.url {
		font-family: var(--f-mono);
		font-size: 13px;
		background: var(--chip);
		border-color: transparent;
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
	.ideas-note {
		margin: 4px 0 0;
		color: var(--muted);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
		gap: 14px;
	}
	.grid > div {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.grid > div > :global(.card) {
		flex: 1;
	}
	.taken :global(h3),
	.taken :global(.note) {
		opacity: 0.55;
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
