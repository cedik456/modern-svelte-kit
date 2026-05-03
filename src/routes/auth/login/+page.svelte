<!-- src/routes/auth/login/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="mx-auto max-w-md">
	<h1 class="text-2xl font-semibold tracking-tight">Login</h1>

	<form method="post" action="?/signInEmail" use:enhance class="mt-6 space-y-4">
		<label class="block text-sm">
			<span class="mb-1 block text-zinc-300">Email</span>
			<input
				type="email"
				name="email"
				autocomplete="email"
				required
				class="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-zinc-100"
			/>
		</label>

		<label class="block text-sm">
			<span class="mb-1 block text-zinc-300">Password</span>
			<input
				type="password"
				name="password"
				autocomplete="current-password"
				required
				class="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-zinc-100"
			/>
		</label>

		<button
			type="submit"
			class="w-full rounded-md bg-blue-500/20 px-3 py-2 font-medium text-blue-100 hover:bg-blue-500/30"
		>
			Sign in
		</button>
	</form>

	{#if form?.message}
		<p class="mt-3 text-sm text-red-300">{form.message}</p>
	{/if}
</div>
