<script lang="ts">
	import { enhance } from '$app/forms';

	let { url }: { url: string } = $props();

	let copied = $state(false);
	let armed = $state(false);
	let field: HTMLInputElement | undefined = $state();

	async function copy() {
		try {
			await navigator.clipboard.writeText(url);
			copied = true;
			setTimeout(() => (copied = false), 2500);
		} catch {
			// Ohne Zugriff auf die Zwischenablage markieren wir den Link zum Kopieren von Hand.
			field?.select();
		}
	}
</script>

<section class="share" aria-labelledby="share-heading">
	<h2 id="share-heading">Teilen-Link</h2>
	<p class="hint">
		Schick diesen Link an alle, die dir etwas schenken möchten. Sie brauchen kein Konto, nur ihren
		Namen.
	</p>
	<label class="sr-only" for="share-url">Teilen-Link</label>
	<input
		id="share-url"
		class="url"
		readonly
		value={url}
		bind:this={field}
		onfocus={(e) => e.currentTarget.select()}
	/>
	<div class="row">
		<button class="btn btn-primary" type="button" onclick={copy}>
			{copied ? 'Kopiert' : 'Link kopieren'}
		</button>
		<form
			method="post"
			action="?/regenerateShare"
			use:enhance={({ cancel }) => {
				if (!armed) {
					armed = true;
					cancel();
					return;
				}
				armed = false;
			}}
		>
			<button class="btn" class:btn-danger={armed} type="submit">
				{armed ? 'Alten Link wirklich ungültig machen?' : 'Neuen Link erzeugen'}
			</button>
		</form>
	</div>
	{#if armed}
		<p class="hint" role="status">
			Wer schon auf der Liste ist, bleibt auf seinem Gerät angemeldet. Der alte Link öffnet die
			Liste aber nicht mehr.
		</p>
	{/if}
</section>

<style>
	.share {
		border: 1px dashed var(--accent);
		border-radius: 8px;
		padding: 14px 16px;
		background: var(--surface);
		display: flex;
		flex-direction: column;
		gap: 10px;
		min-width: 0;
	}
	h2 {
		font-size: 1rem;
		font-family: var(--f-body);
		font-weight: 600;
		letter-spacing: 0;
	}
	.url {
		font-family: var(--f-mono);
		font-size: 13px;
		background: var(--chip);
		border-color: transparent;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
</style>
