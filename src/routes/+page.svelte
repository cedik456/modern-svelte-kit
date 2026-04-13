<script lang="ts">
	const filters = ['All Medals', 'Marathons', 'Triathlons', 'Ironmans'] as const;
	let active = $state<(typeof filters)[number]>('All Medals');

	const medals = [
		{ title: 'Milo Half Marathon', tag: 'Collection Item' },
		{ title: 'Legazpi Half Marathon', tag: 'Collection Item' },
		{ title: 'Charity Run 2025', tag: 'Collection Item' },
		{ title: 'Gubat Half Marathon', tag: 'Collection Item' },
		{ title: 'Cagsawa Half Marathon', tag: 'Collection Item' },
		{ title: 'Sorsogon Halloween Night Run 2025', tag: 'Collection Item' },
		{ title: 'Albay Half Marathon', tag: 'Collection Item' },
		{ title: 'Trenta', tag: 'Collection Item' }
	];

	function cardGradient(i: number) {
		const gradients = [
			'from-amber-500/25 via-zinc-900 to-zinc-950',
			'from-sky-500/20 via-zinc-900 to-zinc-950',
			'from-orange-500/20 via-zinc-900 to-zinc-950',
			'from-yellow-500/15 via-zinc-900 to-zinc-950',
			'from-emerald-500/15 via-zinc-900 to-zinc-950',
			'from-zinc-400/10 via-zinc-900 to-zinc-950',
			'from-rose-500/15 via-zinc-900 to-zinc-950',
			'from-cyan-500/15 via-zinc-900 to-zinc-950'
		];
		return gradients[i % gradients.length];
	}
</script>

<section class="relative">
	<div
		class="pointer-events-none absolute -inset-x-8 -top-24 h-64 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_60%)]"
	></div>

	<div class="relative flex flex-col gap-8">
		<div class="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
			<div>
				<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Collection</h1>
				<p class="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
					A curated archive of historical honors through the lens of architectural modernism.
				</p>
			</div>

			<div class="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
				<div class="flex w-max items-center gap-2 sm:w-auto sm:flex-wrap">
					{#each filters as f}
						<button
							type="button"
							onclick={() => (active = f)}
							class={'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition ' +
								(active === f
									? 'bg-zinc-200 text-zinc-900 ring-white/20'
									: 'bg-zinc-900 text-zinc-200 ring-white/10 hover:bg-zinc-800')}
						>
							{f}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each medals as medal, i}
				<article class="group cursor-pointer">
					<div
						class={'aspect-square overflow-hidden rounded-md bg-gradient-to-br ring-1 ring-inset ring-white/10 transition will-change-transform group-hover:scale-[1.01] ' +
							cardGradient(i)}
					>
						<div class="h-full w-full bg-black/10"></div>
					</div>

					<!-- <p class="mt-3 text-[10px] uppercase tracking-[0.22em] text-zinc-500">{medal.tag}</p> -->
					<h3 class="mt-2 text-sm font-medium text-zinc-100">{medal.title}</h3>
				</article>
			{/each}
		</div>
	</div>
</section>
