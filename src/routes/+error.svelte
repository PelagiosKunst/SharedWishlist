<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Nicht gefunden · SharedWishlist</title>
</svelte:head>

<div class="center">
	<p class="eyebrow">Fehler {page.status}</p>
	<h1>{page.status === 404 ? 'Hier ist nichts' : 'Da ist etwas schiefgegangen'}</h1>
	<p class="lead">
		{page.error?.message && page.status < 500
			? page.error.message
			: 'Lade die Seite neu oder versuch es später noch einmal.'}
	</p>
</div>

<style>
	.center {
		max-width: 480px;
		margin: 8vh auto 0;
		display: flex;
		flex-direction: column;
		gap: 14px;
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
