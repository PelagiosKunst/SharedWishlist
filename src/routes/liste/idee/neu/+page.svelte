<script lang="ts">
	import WishForm from '#lib/components/WishForm.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const empty = { title: '', url: '', price: '', category: '', priority: 'gern', note: '' };
</script>

<svelte:head>
	<title>Neue Idee · SharedWishlist</title>
</svelte:head>

<a class="back" href="/liste">← Zur Liste</a>
<h1>Neue Idee</h1>
<WishForm
	values={form?.values ?? empty}
	errors={form?.errors}
	categories={data.categories}
	submitLabel="Idee speichern"
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
