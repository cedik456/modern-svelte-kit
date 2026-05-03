<script lang="ts">
	import { resolve } from '$app/paths';
	import favicon from '$lib/assets/favicon.png';
	import { archiveSearch } from '$lib/stores/archive';
	import '../app.css';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
	const user = $derived(data.user);
	const userInitial = $derived((user?.name ?? user?.email ?? 'G').charAt(0).toUpperCase());
</script>

<svelte:head>
	<title>Medal Archives</title>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-zinc-950 text-zinc-100">
	<header class="sticky top-0 z-50 border-b border-white/5 bg-zinc-950">
		<div class="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
			<a href={resolve('/')} class="text-sm font-semibold tracking-wide">Medal Archives</a>

			<nav class="hidden items-center gap-6 text-xs text-zinc-300 md:flex">
				<a href={resolve('/')} class="hover:text-white">Archive</a>
				<a href={resolve('/')} class="hover:text-white">About</a>
			</nav>

			<div class="ml-auto flex flex-1 items-center justify-end gap-3">
				<div
					class="hidden w-full max-w-md items-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-3 py-2 sm:flex"
				>
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						class="h-4 w-4 text-zinc-500"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="m21 21-4.3-4.3m1.8-5.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
						/>
					</svg>
					<input
						bind:value={$archiveSearch}
						class="w-full bg-transparent text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
						placeholder="Search the archive..."
						type="search"
					/>
				</div>

				<div
					class="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-blue-400/20 bg-zinc-900 text-xs font-semibold text-zinc-100 ring-1 ring-white/10"
					aria-label="Profile placeholder"
				>
					<div
						class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(96,165,250,0.32),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0))]"
					></div>
					<span class="relative text-sm tracking-[0.08em]">{userInitial}</span>
				</div>

				{#if user}
					<form method="POST" action="/auth/logout" class="hidden sm:block">
						<button
							type="submit"
							class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-white/10 hover:text-white"
						>
							Logout
						</button>
					</form>
				{:else}
					<div class="hidden items-center gap-2 sm:flex">
						<a
							href={resolve('/auth/login')}
							class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-white/10 hover:text-white"
						>
							Login
						</a>
						<a
							href={resolve('/auth/signup')}
							class="rounded-full bg-blue-500 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-400"
						>
							Sign up
						</a>
					</div>
				{/if}
			</div>
		</div>

		<div class="px-4 pb-3 sm:hidden">
			<div
				class="flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-3 py-2"
			>
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					class="h-4 w-4 text-zinc-500"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="m21 21-4.3-4.3m1.8-5.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
					/>
				</svg>
				<input
					bind:value={$archiveSearch}
					class="w-full bg-transparent text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
					placeholder="Search the archive..."
					type="search"
				/>
			</div>

			<nav class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-300">
				<a href={resolve('/')} class="hover:text-white">Archive</a>
				<a href={resolve('/')} class="hover:text-white">About</a>
				{#if user}
					<form method="POST" action="/auth/logout">
						<button type="submit" class="hover:text-white">Logout</button>
					</form>
				{:else}
					<a href={resolve('/auth/login')} class="hover:text-white">Login</a>
					<a href={resolve('/auth/signup')} class="font-medium text-blue-200 hover:text-blue-100">
						Sign up
					</a>
				{/if}
			</nav>
		</div>
	</header>

	<main class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">{@render children()}</main>
</div>
