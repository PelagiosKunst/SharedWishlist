<script lang="ts">
	import { enhance } from '$app/forms';
	import { LIMITS, PRIORITIES, PRIORITY_LABELS } from '#lib/wishes.ts';

	type Values = {
		title: string;
		url: string;
		price: string;
		category: string;
		priority: string;
		note: string;
	};

	type Props = {
		values: Values;
		errors?: Partial<Record<keyof Values, string>>;
		submitLabel: string;
		categories?: string[];
	};

	let { values, errors = {}, submitLabel, categories = [] }: Props = $props();
	let pending = $state(false);
</script>

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
	<label class="field full" for="f-title">
		Was ist die Idee?
		<input
			id="f-title"
			name="title"
			value={values.title}
			maxlength={LIMITS.title}
			required
			aria-invalid={errors.title ? 'true' : undefined}
			aria-describedby={errors.title ? 'f-title-err' : undefined}
		/>
		{#if errors.title}<p class="field-error" id="f-title-err">{errors.title}</p>{/if}
	</label>

	<label class="field full" for="f-url">
		Link zum Shop (optional)
		<input
			id="f-url"
			name="url"
			value={values.url}
			inputmode="url"
			placeholder="https://"
			aria-invalid={errors.url ? 'true' : undefined}
			aria-describedby={errors.url ? 'f-url-err' : undefined}
		/>
		{#if errors.url}<p class="field-error" id="f-url-err">{errors.url}</p>{/if}
	</label>

	<label class="field" for="f-price">
		Preis in Euro (optional)
		<input
			id="f-price"
			name="price"
			value={values.price}
			inputmode="decimal"
			placeholder="49,90"
			aria-invalid={errors.price ? 'true' : undefined}
			aria-describedby={errors.price ? 'f-price-err' : undefined}
		/>
		{#if errors.price}<p class="field-error" id="f-price-err">{errors.price}</p>{/if}
	</label>

	<label class="field" for="f-category">
		Kategorie (optional)
		<input
			id="f-category"
			name="category"
			value={values.category}
			maxlength={LIMITS.category}
			list="f-categories"
			placeholder="Küche, Bücher, Sport"
		/>
		{#if errors.category}<p class="field-error">{errors.category}</p>{/if}
	</label>
	<datalist id="f-categories">
		{#each categories as category (category)}
			<option value={category}></option>
		{/each}
	</datalist>

	<label class="field" for="f-priority">
		Wie sehr freust du dich darüber?
		<select id="f-priority" name="priority" value={values.priority || 'gern'}>
			{#each PRIORITIES as priority (priority)}
				<option value={priority}>{PRIORITY_LABELS[priority]}</option>
			{/each}
		</select>
		{#if errors.priority}<p class="field-error">{errors.priority}</p>{/if}
	</label>

	<label class="field full" for="f-note">
		Notiz (Größe, Farbe, Variante)
		<textarea id="f-note" name="note" maxlength={LIMITS.note}>{values.note}</textarea>
		{#if errors.note}<p class="field-error">{errors.note}</p>{/if}
	</label>

	<div class="full actions">
		<button class="btn btn-primary" type="submit" disabled={pending}>{submitLabel}</button>
		<a class="btn" href="/liste">Abbrechen</a>
	</div>
</form>

<style>
	.form {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
		gap: 14px;
		max-width: 680px;
	}
	.full {
		grid-column: 1 / -1;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
</style>
