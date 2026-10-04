<script lang="ts">
	import { enhance } from '$app/forms';
	import { GIFT_STYLES, GIFT_STYLE_LABELS, LIMITS } from '#lib/wishes.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const values = $derived(form?.values ?? data.list);
	const chosen = $derived<string[]>(form?.giftStyles ?? data.list.giftStyles);
	const errors = $derived<Record<string, string | undefined>>(form?.errors ?? {});

	/** Länge der Vorstellung, sobald getippt wird; vorher die gespeicherte Länge. */
	let typedIntroLength = $state<number | null>(null);
	const introLength = $derived(typedIntroLength ?? values.intro.length);
	let pending = $state(false);
</script>

<svelte:head>
	<title>Über mich · SharedWishlist</title>
</svelte:head>

<a class="back" href="/liste">← Zur Liste</a>
<header class="head">
	<h1>Über mich</h1>
	<p class="hint">
		Ein paar Sätze helfen Schenkenden, auch abseits der Liste etwas Passendes zu finden. Alles ist
		freiwillig.
	</p>
</header>

<form
	method="post"
	class="form"
	novalidate
	use:enhance={() => {
		pending = true;
		return async ({ update }) => {
			await update({ reset: false });
			pending = false;
		};
	}}
>
	<label class="field" for="a-title">
		Name der Liste
		<input
			id="a-title"
			name="title"
			defaultValue={values.title}
			maxlength={LIMITS.listTitle}
			placeholder="Kevins Wunschliste"
		/>
		{#if errors.title}<p class="field-error">{errors.title}</p>{/if}
	</label>

	<label class="field" for="a-intro">
		Stell dich kurz vor
		<textarea
			id="a-intro"
			name="intro"
			rows="3"
			maxlength={LIMITS.intro}
			placeholder="Ich koche gern für Freunde und habe gerade mit dem Bouldern angefangen."
			aria-describedby="a-intro-count"
			defaultValue={values.intro}
			oninput={(e) => (typedIntroLength = e.currentTarget.value.length)}></textarea>
		<span class="count" id="a-intro-count">{introLength} / {LIMITS.intro}</span>
		{#if errors.intro}<p class="field-error">{errors.intro}</p>{/if}
	</label>

	<label class="field" for="a-focus">
		Was beschäftigt dich gerade?
		<input
			id="a-focus"
			name="currentFocus"
			defaultValue={values.currentFocus}
			maxlength={LIMITS.currentFocus}
			placeholder="Umzug im Frühjahr, deshalb lieber nichts Großes."
		/>
		{#if errors.currentFocus}<p class="field-error">{errors.currentFocus}</p>{/if}
	</label>

	<fieldset class="styles">
		<legend>Ich freue mich besonders über</legend>
		<div class="chips">
			{#each GIFT_STYLES as style (style)}
				<label class="chip">
					<input
						type="checkbox"
						name="giftStyles"
						value={style}
						defaultChecked={chosen.includes(style)}
					/>
					<span>{GIFT_STYLE_LABELS[style]}</span>
				</label>
			{/each}
		</div>
	</fieldset>

	<div class="two">
		<label class="field" for="a-sizes">
			Größen
			<input
				id="a-sizes"
				name="sizes"
				defaultValue={values.sizes}
				maxlength={LIMITS.sizes}
				placeholder="Hemd L, Schuhe 43"
			/>
			{#if errors.sizes}<p class="field-error">{errors.sizes}</p>{/if}
		</label>
		<label class="field" for="a-nogos">
			Bitte nicht
			<input
				id="a-nogos"
				name="nogos"
				defaultValue={values.nogos}
				maxlength={LIMITS.nogos}
				placeholder="Duftkerzen, Deko"
			/>
			{#if errors.nogos}<p class="field-error">{errors.nogos}</p>{/if}
		</label>
	</div>

	<div class="actions">
		<button class="btn btn-primary" type="submit" disabled={pending}>Speichern</button>
		<a class="btn" href="/liste">Abbrechen</a>
	</div>
</form>

<style>
	.back {
		font-size: 14px;
		text-decoration: none;
	}
	.head {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	h1 {
		font-size: 2rem;
		font-weight: 700;
	}
	.form {
		display: flex;
		flex-direction: column;
		gap: 16px;
		max-width: 680px;
	}
	.count {
		align-self: flex-end;
		font-family: var(--f-mono);
		font-size: 11px;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}
	.styles {
		border: 0;
		padding: 0;
		margin: 0;
		min-width: 0;
	}
	legend {
		padding: 0;
		margin-bottom: 8px;
		font-size: 14px;
		font-weight: 600;
		color: var(--muted);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	/* Checkboxen als Chips: der echte Haken bleibt für Tastatur und Screenreader erhalten. */
	.chip {
		position: relative;
		cursor: pointer;
	}
	.chip input {
		position: absolute;
		opacity: 0;
		inset: 0;
		width: 100%;
		cursor: pointer;
	}
	.chip span {
		display: inline-block;
		font-size: 14px;
		font-weight: 500;
		padding: 6px 14px;
		border-radius: 999px;
		border: 1px solid var(--line);
	}
	.chip input:checked + span {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--accent-ink);
	}
	.chip input:focus-visible + span {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
	.two {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
		gap: 14px;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
</style>
