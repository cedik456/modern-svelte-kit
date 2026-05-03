<script lang="ts">
	import { enhance } from '$app/forms';
	import { medals } from '$lib/data/medals';
	import { upcomingRaces } from '$lib/data/races';
	import { archiveSearch } from '$lib/stores/archive';
	import type { Medal } from '$lib/types/medal';
	import type { ActionData, PageData } from './$types';
	import { fade, scale } from 'svelte/transition';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const filters = [
		'All Entries',
		'Full Marathon',
		'Half Marathon',
		'Upcoming',
		'Other Distances'
	] as const;
	let active = $state<(typeof filters)[number]>('All Entries');
	let selectedMedal = $state<Medal | null>(null);
	let showAddAchievement = $state(false);

	$effect(() => {
		if (form?.message) showAddAchievement = true;
	});

	function getCardSrc(medal: Medal) {
		return medal.thumbnailSrc ?? medal.src ?? medal.fullSrc;
	}

	function getModalSrc(medal: Medal) {
		return medal.fullSrc ?? medal.src ?? medal.thumbnailSrc;
	}

	function getCardSrcSet(medal: Medal) {
		const largeSrc = medal.fullSrc ?? medal.src;
		if (!medal.thumbnailSrc || !largeSrc || medal.thumbnailSrc === largeSrc) return undefined;
		return `${medal.thumbnailSrc} 720w, ${largeSrc} 1200w`;
	}

	function matchesSearch(medal: Medal, query: string) {
		const q = query.trim().toLowerCase();
		if (!q) return true;

		const haystack = [medal.title, medal.distanceLabel, medal.eventDate, medal.finishTime]
			.filter(Boolean)
			.join(' ')
			.toLowerCase();

		return haystack.includes(q);
	}

	function matchesFilter(medal: Medal, filter: (typeof filters)[number]) {
		const distance = medal.distanceLabel?.toLowerCase() ?? '';

		if (filter === 'All Entries') return true;

		if (filter === 'Full Marathon') {
			return distance.includes('full marathon');
		}

		if (filter === 'Half Marathon') {
			return distance.includes('half marathon');
		}

		if (filter === 'Other Distances') {
			return distance && !distance.includes('half marathon') && !distance.includes('full marathon');
		}

		return false;
	}

	let searchQuery = $derived($archiveSearch.trim().toLowerCase());
	let isSignedIn = $derived(Boolean(data.user));
	let archiveEntries = $derived(isSignedIn ? data.achievements : medals);

	let filteredMedals = $derived(
		archiveEntries.filter(
			(medal) => matchesSearch(medal, searchQuery) && matchesFilter(medal, active)
		)
	);

	let filteredUpcomingRaces = $derived(
		upcomingRaces.filter((race) => matchesSearch(race, searchQuery))
	);

	let visibleEntries = $derived(active === 'Upcoming' ? filteredUpcomingRaces : filteredMedals);
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') {
			selectedMedal = null;
			showAddAchievement = false;
		}
	}}
/>

<section class="relative">
	<div
		class="pointer-events-none absolute -inset-x-8 -top-24 h-64 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_60%)]"
	></div>

	<div class="relative flex min-w-0 flex-col gap-6 sm:gap-8">
		<div class="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
			<div class="min-w-0">
				<h1 class="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Collection</h1>
				<p class="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:mt-3">
					{#if isSignedIn}
						Your personal race archive, saved in the database and attached to your account.
					{:else}
						An archive of every race I’ve been in. Sign in to build your own archive.
					{/if}
				</p>
			</div>

			<div class="flex min-w-0 flex-col gap-3 lg:items-end">
				<div
					class="-mx-4 max-w-[calc(100vw-2rem)] overflow-x-auto overflow-y-hidden px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:max-w-full sm:px-0"
				>
					<div class="flex w-max items-center gap-2 sm:w-auto sm:flex-wrap">
						{#each filters as filter (filter)}
							<button
								type="button"
								onclick={() => (active = filter)}
								class={'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition ' +
									(active === filter
										? 'bg-zinc-200 text-zinc-900 ring-white/20'
										: filter === 'Upcoming'
											? 'bg-blue-400/5 text-blue-200 ring-blue-400/25 hover:bg-blue-400/10'
											: 'bg-zinc-900 text-zinc-200 ring-white/10 hover:bg-zinc-800')}
							>
								{filter}
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>

		{#if !isSignedIn}
			<section class="rounded-2xl border border-white/10 bg-zinc-900/40 p-5 text-sm text-zinc-300">
				Create an account to save your own race results, finish times, links, and medal images in
				Postgres.
			</section>
		{/if}

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#if visibleEntries.length}
				{#each visibleEntries as medal (medal.title)}
					<button
						type="button"
						class="group cursor-pointer text-left"
						onclick={() => (selectedMedal = medal)}
					>
						<article>
							<div
								class={getCardSrc(medal)
									? 'aspect-square overflow-hidden rounded-md ring-1 ring-inset ring-white/10'
									: 'aspect-[4/3] overflow-hidden rounded-md ring-1 ring-inset ring-white/10 sm:aspect-square'}
							>
								{#if getCardSrc(medal)}
									<img
										src={getCardSrc(medal)}
										srcset={getCardSrcSet(medal)}
										sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
										alt={medal.title}
										class="h-full w-full object-cover transition will-change-transform group-hover:scale-[1.01]"
										loading="lazy"
										decoding="async"
									/>
								{:else}
									<div
										class="flex h-full w-full items-center justify-center bg-zinc-900 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500"
									>
										Coming Soon
									</div>
								{/if}
							</div>

							<!-- <p class="mt-3 text-[10px] uppercase tracking-[0.22em] text-zinc-500">{medal.tag}</p> -->
							<h3 class="mt-2 text-sm font-medium text-zinc-100">{medal.title}</h3>
							{#if medal.distanceLabel}
								<p class="mt-1 text-xs text-zinc-400">{medal.distanceLabel}</p>
							{/if}
						</article>
					</button>
				{/each}
			{:else}
				<div
					class="col-span-full rounded-2xl border border-dashed border-white/10 bg-zinc-900/40 p-6 text-sm text-zinc-400 sm:p-8"
				>
					{#if active === 'Upcoming'}
						No upcoming races match your search yet.
					{:else if isSignedIn}
						Your archive is empty. Add your first achievement to start your collection.
					{:else}
						No entries match your search.
					{/if}
				</div>
			{/if}
		</div>
	</div>
</section>

{#if isSignedIn}
	<div class="fixed bottom-4 right-4 z-60 sm:bottom-6 sm:right-6">
		<div
			class="pointer-events-none absolute inset-0 rounded-full bg-blue-400/25 blur-md motion-safe:animate-pulse"
		></div>
		<button
			type="button"
			onclick={() => (showAddAchievement = true)}
			class="relative inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-blue-300/35 bg-zinc-950/80 px-3 py-2 text-xs font-semibold text-blue-100 shadow-lg shadow-black/30 backdrop-blur-sm ring-1 ring-white/10 transition hover:border-blue-200/60 hover:bg-blue-400/10 hover:text-white sm:gap-2 sm:px-4"
			aria-label="Add achievement"
		>
			<span
				class="grid h-5 w-5 place-items-center rounded-full bg-blue-300/15 text-sm leading-none text-blue-100 ring-1 ring-blue-200/25"
			>
				+
			</span>
			<span>Add achievement</span>
		</button>
	</div>
{:else}
	<a
		href="https://www.strava.com"
		target="_blank"
		rel="noopener noreferrer external"
		class="fixed bottom-5 right-5 z-60 inline-flex items-center rounded-full border border-[#FC4C02]/40 bg-zinc-950/75 px-4 py-2 text-xs font-semibold text-[#FC4C02] shadow-lg shadow-black/30 backdrop-blur-sm transition hover:border-[#FC4C02]/60 hover:bg-[#FC4C02]/10 sm:bottom-6 sm:right-6"
	>
		Follow on Strava
	</a>
{/if}

{#if showAddAchievement}
	<div class="fixed inset-0 z-70 overflow-y-auto" transition:fade={{ duration: 100 }}>
		<button
			type="button"
			class="fixed inset-0 bg-black/60 backdrop-blur-[1px]"
			aria-label="Close add achievement form"
			onclick={() => (showAddAchievement = false)}
		></button>

		<div class="relative z-10 mx-auto flex min-h-full max-w-3xl items-center px-4 py-8 sm:px-6">
			<div
				role="dialog"
				aria-modal="true"
				aria-label="Add achievement"
				class="w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl shadow-black/50 ring-1 ring-white/5"
				transition:scale={{ duration: 140, start: 0.98 }}
			>
				<div class="flex items-start gap-4 border-b border-white/10 p-5 sm:p-6">
					<div>
						<p class="text-xs font-medium uppercase tracking-[0.2em] text-blue-200/80">
							New archive entry
						</p>
						<h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">
							Add an achievement
						</h2>
					</div>
					<button
						type="button"
						class="ml-auto rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white"
						onclick={() => (showAddAchievement = false)}
					>
						Close
					</button>
				</div>

				<form
					method="POST"
					action="?/createAchievement"
					use:enhance={() => {
						return async ({ result, update }) => {
							await update();
							if (result.type === 'success') showAddAchievement = false;
						};
					}}
					class="grid max-h-[calc(100vh-11rem)] gap-4 overflow-y-auto p-5 sm:grid-cols-2 sm:p-6"
				>
					<label class="block text-sm">
						<span class="mb-1 block text-zinc-300">Title</span>
						<input
							name="title"
							required
							class="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2.5 text-zinc-100 outline-none ring-blue-400/30 transition placeholder:text-zinc-600 focus:border-blue-300/50 focus:ring-4"
							placeholder="Legazpi Marathon 2026"
						/>
					</label>

					<label class="block text-sm">
						<span class="mb-1 block text-zinc-300">Distance</span>
						<input
							name="distanceLabel"
							class="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2.5 text-zinc-100 outline-none ring-blue-400/30 transition placeholder:text-zinc-600 focus:border-blue-300/50 focus:ring-4"
							placeholder="Full Marathon"
						/>
					</label>

					<label class="block text-sm">
						<span class="mb-1 block text-zinc-300">Event date</span>
						<input
							type="date"
							name="eventDate"
							class="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2.5 text-zinc-100 outline-none ring-blue-400/30 transition focus:border-blue-300/50 focus:ring-4"
						/>
					</label>

					<label class="block text-sm">
						<span class="mb-1 block text-zinc-300">Location</span>
						<input
							name="location"
							class="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2.5 text-zinc-100 outline-none ring-blue-400/30 transition placeholder:text-zinc-600 focus:border-blue-300/50 focus:ring-4"
							placeholder="Legazpi, Albay"
						/>
					</label>

					<label class="block text-sm">
						<span class="mb-1 block text-zinc-300">Finish time</span>
						<input
							name="finishTime"
							class="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2.5 text-zinc-100 outline-none ring-blue-400/30 transition placeholder:text-zinc-600 focus:border-blue-300/50 focus:ring-4"
							placeholder="3:52:30"
						/>
					</label>

					<label class="block text-sm">
						<span class="mb-1 block text-zinc-300">Pace</span>
						<input
							name="pace"
							class="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2.5 text-zinc-100 outline-none ring-blue-400/30 transition placeholder:text-zinc-600 focus:border-blue-300/50 focus:ring-4"
							placeholder="5:40 /km"
						/>
					</label>

					<label class="block text-sm">
						<span class="mb-1 block text-zinc-300">Placement</span>
						<input
							name="placement"
							class="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2.5 text-zinc-100 outline-none ring-blue-400/30 transition placeholder:text-zinc-600 focus:border-blue-300/50 focus:ring-4"
							placeholder="Top 18 Overall"
						/>
					</label>

					<label class="block text-sm">
						<span class="mb-1 block text-zinc-300">Strava URL</span>
						<input
							type="url"
							name="stravaUrl"
							class="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2.5 text-zinc-100 outline-none ring-blue-400/30 transition placeholder:text-zinc-600 focus:border-blue-300/50 focus:ring-4"
							placeholder="https://strava.app.link/..."
						/>
					</label>

					<label class="block text-sm sm:col-span-2">
						<span class="mb-1 block text-zinc-300">Image URL or `/medals/...` path</span>
						<input
							name="imageUrl"
							class="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2.5 text-zinc-100 outline-none ring-blue-400/30 transition placeholder:text-zinc-600 focus:border-blue-300/50 focus:ring-4"
							placeholder="/medals/legazpi_marathon_2026.webp"
						/>
					</label>

					<label class="block text-sm sm:col-span-2">
						<span class="mb-1 block text-zinc-300">Description</span>
						<textarea
							name="description"
							rows="4"
							class="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2.5 text-zinc-100 outline-none ring-blue-400/30 transition placeholder:text-zinc-600 focus:border-blue-300/50 focus:ring-4"
							placeholder="Race notes, conditions, and what made the event memorable."
						></textarea>
					</label>

					<div class="flex flex-col gap-3 pt-2 sm:col-span-2 sm:flex-row sm:items-center">
						<button
							type="submit"
							class="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400"
						>
							Save achievement
						</button>

						<button
							type="button"
							class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white"
							onclick={() => (showAddAchievement = false)}
						>
							Cancel
						</button>

						{#if form?.message}
							<p class="text-sm text-red-300 sm:ml-auto">{form.message}</p>
						{/if}
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}

{#if selectedMedal}
	<div class="fixed inset-0 z-70" transition:fade={{ duration: 100 }}>
		<button
			type="button"
			class="absolute inset-0 bg-black/55 backdrop-blur-[1px]"
			aria-label="Close medal preview"
			onclick={() => (selectedMedal = null)}
		></button>

		<div
			class="relative z-10 mx-auto flex min-h-full max-w-4xl items-center px-4 py-8 sm:px-6 lg:px-8"
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-label={selectedMedal.title}
				class="w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/85 shadow-2xl shadow-black/50 ring-1 ring-white/5 md:h-88"
				transition:scale={{ duration: 140, start: 0.98 }}
			>
				<div class="grid h-full gap-0 md:grid-cols-[1.05fr_1fr]">
					<div class="relative h-72 overflow-hidden bg-zinc-900 md:h-full">
						{#if getModalSrc(selectedMedal)}
							<img
								src={getModalSrc(selectedMedal)}
								alt={selectedMedal.title}
								class="h-full w-full object-cover"
								loading="eager"
								fetchpriority="high"
								decoding="async"
							/>
						{:else}
							<div
								class="flex h-full w-full items-center justify-center bg-zinc-900 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500"
							>
								Coming Soon
							</div>
						{/if}
						<div
							class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/20 to-transparent"
						></div>
					</div>

					<div
						class="min-h-0 overflow-y-auto border-t border-white/10 p-6 sm:p-8 md:border-t-0 md:border-l"
					>
						<div class="flex items-start gap-4">
							<div>
								<h2 class="text-2xl font-semibold tracking-tight text-zinc-100">
									{selectedMedal.title}
								</h2>
								{#if selectedMedal.distanceLabel}
									<p class="mt-2 text-sm text-zinc-300">{selectedMedal.distanceLabel}</p>
								{/if}
							</div>
							<button
								type="button"
								class="ml-auto rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white"
								onclick={() => (selectedMedal = null)}
							>
								Close
							</button>
						</div>

						<div class="space-y-2 text-sm text-zinc-300">
							<p>
								<span class="text-zinc-500">Date:</span>
								{selectedMedal.eventDate ?? 'To be added'}
							</p>
							<p>
								<span class="text-zinc-500">Location:</span>
								{selectedMedal.location ?? 'To be added'}
							</p>
							<p>
								<span class="text-zinc-500">Finish Time:</span>
								{selectedMedal.finishTime ?? 'To be added'}
							</p>
							<p>
								<span class="text-zinc-500">Pace / Result:</span>
								{#if selectedMedal.pace || selectedMedal.placement}
									{selectedMedal.pace ?? '—'}{selectedMedal.placement
										? ` • ${selectedMedal.placement}`
										: ''}
								{:else}
									To be added
								{/if}
							</p>
						</div>

						{#if selectedMedal.stravaUrl}
							<a
								href={selectedMedal.stravaUrl}
								target="_blank"
								rel="noopener noreferrer external"
								class="mt-4 inline-flex w-fit items-center text-xs font-semibold text-[#FC4C02] underline underline-offset-4 decoration-[#FC4C02]/60 transition hover:decoration-[#FC4C02]"
							>
								View on Strava
							</a>
						{/if}

						<p class="mt-4 text-sm leading-relaxed text-zinc-400">
							{selectedMedal.description ??
								'A short race note can go here — conditions, race strategy, and key moments from the day.'}
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
