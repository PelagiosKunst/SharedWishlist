<script lang="ts">
	import WishForm from '#lib/components/WishForm.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Idee bearbeiten · SharedWishlist</title>
</svelte:head>

<a class="back" href="/liste">← Zur Liste</a>
<h1>Idee bearbeiten</h1>
<WishForm
	values={form?.values ?? data.values}
	errors={form?.errors}
	categories={data.categories}
	submitLabel="Änderung speichern"
/>

<style>
	h1 {
		font-size: 2rem;
		font-weight: 700;
	}
	.back {
		font-size: 14px;
		text-decoration: none;
	}
</style>
