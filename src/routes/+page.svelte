<script lang="ts">
	import { medals } from '$lib/data/medals';
	import { upcomingRaces } from '$lib/data/races';
	import { archiveSearch } from '$lib/stores/archive';
	import type { Medal } from '$lib/types/medal';
	import { fade, scale } from 'svelte/transition';

	const filters = [
		'All Entries',
		'Full Marathon',
		'Half Marathon',
		'Upcoming',
		'Other Distances'
	] as const;
	let active = $state<(typeof filters)[number]>('All Entries');
	let selectedMedal = $state<Medal | null>(null);

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

	let filteredMedals = $derived(
		medals.filter((medal) => matchesSearch(medal, searchQuery) && matchesFilter(medal, active))
	);

	let filteredUpcomingRaces = $derived(
		upcomingRaces.filter((race) => matchesSearch(race, searchQuery))
	);

	let visibleEntries = $derived(active === 'Upcoming' ? filteredUpcomingRaces : filteredMedals);
</script>

<svelte:window onkeydown={(event) => event.key === 'Escape' && (selectedMedal = null)} />

<section class="relative">
	<div
		class="pointer-events-none absolute -inset-x-8 -top-24 h-64 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_60%)]"
	></div>

	<div class="relative flex flex-col gap-8">
		<div class="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
			<div>
				<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Collection</h1>
				<p class="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
					An archive of every race I’ve been in.
				</p>
			</div>

			<div
				class="-mx-4 overflow-x-auto overflow-y-hidden px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0"
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

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each visibleEntries as medal (medal.title)}
				<button
					type="button"
					class="group cursor-pointer text-left"
					onclick={() => (selectedMedal = medal)}
				>
					<article>
						<div class="aspect-square overflow-hidden rounded-md ring-1 ring-inset ring-white/10">
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
		</div>
	</div>
</section>

<a
	href="https://www.strava.com"
	target="_blank"
	rel="noopener noreferrer external"
	class="fixed bottom-5 right-8 z-60 inline-flex items-center rounded-full border border-[#FC4C02]/50 bg-[#FC4C02]/15 px-4 py-2 text-xs font-semibold text-[#FC4C02] shadow-lg shadow-black/30 backdrop-blur-sm transition hover:bg-[#FC4C02]/25 sm:bottom-6 sm:right-6"
>
	Follow me on Strava
</a>

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
