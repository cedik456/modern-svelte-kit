<script lang="ts">
	import { archiveSearch } from '$lib/stores/archive';
	import type { Medal } from '$lib/types/medal';
	import type { PageData } from './$types';
	import { fade, scale } from 'svelte/transition';

	let { data }: { data: PageData } = $props();
	let selectedMedal = $state<Medal | null>(null);
	let selectedModalImageIndex = $state(0);

	const profileInitial = $derived(data.profile.name.charAt(0).toUpperCase());

	function getCardSrc(medal: Medal) {
		return medal.thumbnailSrc ?? medal.src ?? medal.fullSrc;
	}

	function getModalSrc(medal: Medal) {
		const galleryImage = medal.images?.[selectedModalImageIndex];
		if (galleryImage) return galleryImage.fullSrc;
		return medal.fullSrc ?? medal.src ?? medal.thumbnailSrc;
	}

	function getModalThumbnail(medal: Medal, index: number) {
		return medal.images?.[index]?.thumbnailSrc;
	}

	function getCardSrcSet(medal: Medal) {
		const largeSrc = medal.fullSrc ?? medal.src;
		if (!medal.thumbnailSrc || !largeSrc || medal.thumbnailSrc === largeSrc) return undefined;
		return `${medal.thumbnailSrc} 720w, ${largeSrc} 1200w`;
	}

	function openMedal(medal: Medal) {
		selectedMedal = medal;
		selectedModalImageIndex = 0;
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

	let searchQuery = $derived($archiveSearch.trim().toLowerCase());
	let filteredAchievements = $derived(
		data.achievements.filter((medal) => matchesSearch(medal, searchQuery))
	);
</script>

<svelte:head>
	<title>{data.profile.name} | Medal Archives</title>
</svelte:head>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') {
			selectedMedal = null;
		}
	}}
/>

<section class="relative">
	<div
		class="pointer-events-none absolute -inset-x-8 -top-24 h-64 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_60%)]"
	></div>

	<div class="relative flex flex-col gap-8">
		<header
			class="grid gap-6 border-b border-white/10 pb-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
		>
			<div class="flex min-w-0 items-center gap-4">
				{#if data.profile.image}
					<img
						src={data.profile.image}
						alt={data.profile.name}
						class="h-16 w-16 rounded-full object-cover ring-1 ring-white/10 sm:h-20 sm:w-20"
					/>
				{:else}
					<div
						class="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-blue-400/20 bg-zinc-900 text-xl font-semibold text-zinc-100 ring-1 ring-white/10 sm:h-20 sm:w-20"
					>
						{profileInitial}
					</div>
				{/if}

				<div class="min-w-0">
					<p class="text-xs font-medium text-blue-200/80">@{data.profile.username}</p>
					<h1 class="mt-2 truncate text-3xl font-semibold leading-tight text-zinc-100 sm:text-4xl">
						{data.profile.name}
					</h1>
					<p class="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
						Public race archive and medal collection.
					</p>
				</div>
			</div>

			<div
				class="flex flex-wrap items-center gap-x-3 gap-y-2 py-1 text-xs text-zinc-300 sm:gap-x-4"
			>
				<div class="min-w-0">
					<p class="font-medium uppercase text-zinc-500">Entries</p>
					<p class="font-semibold text-zinc-100">{data.stats.totalAchievements}</p>
				</div>
				<div class="h-6 w-px bg-white/10"></div>
				<div class="min-w-0">
					<p class="font-medium uppercase text-zinc-500">Favorite</p>
					<p class="max-w-xs truncate font-semibold text-zinc-100">
						{data.stats.favoriteDistance ?? 'None yet'}
					</p>
				</div>
				<div class="h-6 w-px bg-white/10"></div>
				<div class="min-w-0">
					<p class="font-medium uppercase text-zinc-500">Latest</p>
					<p class="max-w-xs truncate font-semibold text-zinc-100">
						{data.stats.latestAchievement ?? 'None yet'}
					</p>
				</div>
			</div>
		</header>

		<section>
			<h2 class="text-xl font-semibold tracking-tight text-zinc-100">Archive</h2>

			<div class="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#if filteredAchievements.length}
					{#each filteredAchievements as medal (medal.id ?? medal.title)}
						<button
							type="button"
							class="group cursor-pointer text-left"
							onclick={() => openMedal(medal)}
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
											class="flex h-full w-full items-center justify-center bg-zinc-900 text-[10px] font-medium uppercase text-zinc-500"
										>
											Coming Soon
										</div>
									{/if}
								</div>

								<h3 class="mt-2 text-sm font-medium text-zinc-100">{medal.title}</h3>
								{#if medal.distanceLabel}
									<p class="mt-1 text-xs text-zinc-400">{medal.distanceLabel}</p>
								{/if}
							</article>
						</button>
					{/each}
				{:else if data.achievements.length}
					<div
						class="col-span-full rounded-md border border-dashed border-white/10 bg-zinc-900/40 p-6 text-sm text-zinc-400 sm:p-8"
					>
						No public achievements match your search.
					</div>
				{:else}
					<div
						class="col-span-full rounded-md border border-dashed border-white/10 bg-zinc-900/40 p-6 text-sm text-zinc-400 sm:p-8"
					>
						This profile has no public achievements yet.
					</div>
				{/if}
			</div>
		</section>
	</div>
</section>

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
								class="flex h-full w-full items-center justify-center bg-zinc-900 text-xs font-medium uppercase text-zinc-500"
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
									{selectedMedal.pace ?? '-'}{selectedMedal.placement
										? ` - ${selectedMedal.placement}`
										: ''}
								{:else}
									To be added
								{/if}
							</p>
						</div>

						{#if selectedMedal.images && selectedMedal.images.length > 1}
							<div class="mt-5 flex gap-2 overflow-x-auto pb-1">
								{#each selectedMedal.images as image, index (image.id ?? image.fullSrc)}
									<button
										type="button"
										class={'overflow-hidden rounded-md ring-1 ring-inset transition ' +
											(selectedModalImageIndex === index
												? 'ring-blue-300/70'
												: 'ring-white/10 hover:ring-white/20')}
										onclick={() => (selectedModalImageIndex = index)}
										aria-label={`Show image ${index + 1}`}
									>
										<img
											src={getModalThumbnail(selectedMedal, index)}
											alt={`${selectedMedal.title} preview ${index + 1}`}
											class="h-14 w-14 object-cover"
											loading="lazy"
											decoding="async"
										/>
									</button>
								{/each}
							</div>
						{/if}

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
								'A short race note can go here - conditions, race strategy, and key moments from the day.'}
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
