<script lang="ts">
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>SharedWishlist</title>
</svelte:head>

<main class="wrap">
	{@render children()}
</main>

<style>
	.wrap {
		max-width: 1040px;
		margin: 0 auto;
		padding-inline: clamp(16px, 4vw, 32px);
		padding-block: 32px 72px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
</style>
