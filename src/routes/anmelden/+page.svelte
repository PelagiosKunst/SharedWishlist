<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	let pending = $state(false);
	/** „Andere E-Mail-Adresse“ blendet das Formular wieder ein, ohne die Seite neu zu laden. */
	let editAgain = $state(false);

	const sent = $derived(Boolean(form && 'sent' in form && form.sent) && !editAgain);
</script>

<svelte:head>
	<title>Anmelden · SharedWishlist</title>
</svelte:head>

<div class="center">
	{#if sent && form && 'sent' in form}
		<p class="eyebrow">SharedWishlist</p>
		<h1>Schau in dein Postfach</h1>
		<p class="lead">
			Wir haben einen Link an <strong>{form.email}</strong> geschickt. Er gilt 15 Minuten und funktioniert
			einmal.
		</p>
		{#if form.testLink}
			<p class="hint">Testmodus: <a href={form.testLink}>Anmeldelink öffnen</a></p>
		{/if}
		<button class="btn" type="button" onclick={() => (editAgain = true)}>
			Andere E-Mail-Adresse
		</button>
	{:else}
		<p class="eyebrow">SharedWishlist</p>
		<h1>Deine Wunschliste</h1>
		<p class="lead">Wir schicken dir einen Link zum Anmelden. Kein Passwort nötig.</p>
		<form
			method="post"
			novalidate
			use:enhance={() => {
				pending = true;
				return async ({ update }) => {
					await update({ reset: false });
					pending = false;
					editAgain = false;
				};
			}}
		>
			<label class="field" for="email">
				E-Mail-Adresse
				<input
					id="email"
					name="email"
					type="email"
					autocomplete="email"
					required
					defaultValue={form && 'email' in form ? form.email : ''}
					aria-invalid={form && 'error' in form ? 'true' : undefined}
					aria-describedby={form && 'error' in form ? 'email-err' : undefined}
				/>
			</label>
			{#if form && 'error' in form}
				<p class="field-error" id="email-err" role="alert">{form.error}</p>
			{/if}
			<button class="btn btn-primary block" type="submit" disabled={pending}>
				Anmeldelink schicken
			</button>
		</form>
		<p class="hint">
			Du willst jemandem etwas schenken? Dann brauchst du kein Konto, nur den Link zur Liste.
		</p>
	{/if}
</div>

<style>
	.center {
		max-width: 420px;
		margin: 8vh auto 0;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	h1 {
		font-size: clamp(2rem, 7vw, 2.6rem);
		font-weight: 700;
	}
	.lead {
		margin: 0;
		color: var(--muted);
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.block {
		justify-content: center;
		padding: 11px 14px;
	}
	.btn:not(.block) {
		align-self: flex-start;
	}
</style>
