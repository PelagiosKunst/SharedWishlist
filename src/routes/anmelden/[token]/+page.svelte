<script lang="ts">
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<svelte:head>
	<title>Anmelden · SharedWishlist</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="center">
	<p class="eyebrow">SharedWishlist</p>
	{#if form?.invalid}
		<h1>Dieser Link funktioniert nicht mehr</h1>
		<p class="lead">
			Anmeldelinks gelten 15 Minuten und nur einmal. Fordere einfach einen neuen an.
		</p>
		<a class="btn btn-primary" href="/anmelden">Neuen Link anfordern</a>
	{:else}
		<h1>Fast geschafft</h1>
		<p class="lead">Tippe auf den Knopf, um dich auf diesem Gerät anzumelden.</p>
		<form method="post">
			<button class="btn btn-primary" type="submit">Jetzt anmelden</button>
		</form>
	{/if}
</div>

<style>
	.center {
		max-width: 420px;
		margin: 8vh auto 0;
		display: flex;
		flex-direction: column;
		gap: 16px;
		align-items: flex-start;
	}
	h1 {
		font-size: clamp(2rem, 7vw, 2.6rem);
		font-weight: 700;
	}
	.lead {
		margin: 0;
		color: var(--muted);
	}
</style>
