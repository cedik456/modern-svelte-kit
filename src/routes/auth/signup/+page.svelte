<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let isSigningUp = $state(false);
</script>

<section class="flex min-h-[calc(100vh-10rem)] items-center justify-center">
	<div class="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70 shadow-2xl shadow-black/30 md:grid-cols-[1.05fr_0.95fr]">
		<div class="flex items-center px-6 py-10 sm:px-10">
			<div class="w-full">
				<p class="text-xs font-medium uppercase tracking-[0.22em] text-blue-200/80">
					Start your archive
				</p>
				<h1 class="mt-3 text-3xl font-semibold tracking-tight text-zinc-100">Create account</h1>
				<p class="mt-2 text-sm text-zinc-400">
					Save race results, medal images, Strava links, and personal notes.
				</p>

				<form
					method="post"
					action="?/signUpEmail"
					use:enhance={() => {
						isSigningUp = true;

						return async ({ update }) => {
							await update();
							isSigningUp = false;
						};
					}}
					class="mt-8 space-y-4"
				>
					<label class="block text-sm">
						<span class="mb-1 block text-zinc-300">Name</span>
						<input
							name="name"
							autocomplete="name"
							required
							class="w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2.5 text-zinc-100 outline-none ring-blue-400/30 transition placeholder:text-zinc-600 focus:border-blue-300/50 focus:ring-4"
							placeholder="Your name"
						/>
					</label>

					<label class="block text-sm">
						<span class="mb-1 block text-zinc-300">Email</span>
						<input
							type="email"
							name="email"
							autocomplete="email"
							required
							class="w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2.5 text-zinc-100 outline-none ring-blue-400/30 transition placeholder:text-zinc-600 focus:border-blue-300/50 focus:ring-4"
							placeholder="you@example.com"
						/>
					</label>

					<label class="block text-sm">
						<span class="mb-1 block text-zinc-300">Password</span>
						<input
							type="password"
							name="password"
							autocomplete="new-password"
							required
							class="w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2.5 text-zinc-100 outline-none ring-blue-400/30 transition placeholder:text-zinc-600 focus:border-blue-300/50 focus:ring-4"
							placeholder="Create a password"
						/>
					</label>

					<button
						type="submit"
						class="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-500 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-80"
						disabled={isSigningUp}
					>
						{#if isSigningUp}
							<span
								aria-hidden="true"
								class="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white motion-safe:animate-spin"
							></span>
							Creating account...
						{:else}
							Create account
						{/if}
					</button>
				</form>

				{#if form?.message}
					<p class="mt-4 rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">
						{form.message}
					</p>
				{/if}

				<p class="mt-6 text-center text-sm text-zinc-400">
					Already have an account?
					<a href={resolve('/auth/login')} class="font-medium text-blue-200 hover:text-blue-100">
						Sign in
					</a>
				</p>
			</div>
		</div>

		<div class="relative hidden min-h-[34rem] overflow-hidden border-l border-white/10 bg-zinc-950 md:block">
			<img
				src="/medals/summer_fitness_run_2026.webp"
				alt="Summer Fitness Run medal"
				class="absolute inset-0 h-full w-full object-cover opacity-75"
			/>
			<div class="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/10"></div>
			<div class="relative z-10 flex h-full flex-col justify-end p-8">
				<p class="text-xs font-medium uppercase tracking-[0.24em] text-blue-200/80">
					Personal records
				</p>
				<h2 class="mt-3 text-3xl font-semibold leading-tight text-white">
					Build an archive that belongs to your account.
				</h2>
				<p class="mt-4 text-sm leading-relaxed text-zinc-300">
					Each achievement is saved under your user ID, so every runner gets their own collection.
				</p>
			</div>
		</div>
	</div>
</section>
