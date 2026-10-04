<script lang="ts">
	import { page } from '$app/state';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.title} · SharedWishlist</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="center">
	<p class="eyebrow">{data.title}</p>
	{#if !data.name || form?.invalid}
		<h1>Dieser persönliche Link gilt nicht mehr</h1>
		<p class="lead">
			Vielleicht wurde inzwischen ein neuer erzeugt. Öffne die Liste auf deinem ersten Gerät und
			tippe dort noch einmal auf „Auf anderem Gerät öffnen“.
		</p>
		<a class="btn" href="/l/{page.params.token}">Zur Liste</a>
	{:else}
		<h1>Als {data.name} weitermachen?</h1>
		<p class="lead">Danach siehst du auf diesem Gerät deine Reservierungen.</p>
		<form method="post">
			<button class="btn btn-primary" type="submit">Ja, als {data.name} weitermachen</button>
		</form>
	{/if}
</div>

<style>
	.center {
		max-width: 440px;
		margin: 6vh auto 0;
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
