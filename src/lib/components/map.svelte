<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { SvelteMap } from 'svelte/reactivity';
	import {
		Anvil,
		ChefHat,
		Factory,
		Fish,
		Flame,
		House,
		Pickaxe,
		Shield,
		Sword,
		Swords,
		TreePine,
		Wheat,
	} from 'lucide-svelte';
	import type { CityDefinition, ItemDefinition, JobSubType } from '../../gen/v1/masterdata_pb';
	import type { Monster } from '../../gen/v1/domain_pb';
	import type { BattleJobInfo, ProductionJobInfo } from '../../gen/v1/service_pb';
	import { protoToMilliseconds } from '$lib/utils/prototime';
	import { gameStateStore } from '$lib/stores/gamestate.svelte';
	import { userStore } from '$lib/stores/user.svelte';
	import { JobsClient } from '$lib/service/jobs';
	import JobDefinitionCard from '$lib/widgets/job-definition-card.svelte';

	type MapJobKind = 'production' | 'battle';
	type MapJob = {
		id: string;
		kind: MapJobKind;
		subType: JobSubType;
		x: number;
		y: number;
		definition: ProductionJobInfo['definition'] | BattleJobInfo['definition'];
		routeInfo: ProductionJobInfo['routeInfo'] | BattleJobInfo['routeInfo'];
	};

	type SubtypeMeta = {
		label: string;
		badgeClass: string;
		pinClass: string;
		icon: any;
	};

	let {
		monsters,
		cities,
		productionJobs,
		battleJobs,
		items,
	}: {
		monsters: Monster[];
		cities: CityDefinition[];
		productionJobs: ProductionJobInfo[];
		battleJobs: BattleJobInfo[];
		items: SvelteMap<string, ItemDefinition>;
		[key: string]: unknown;
	} = $props();

	const TILE_SIZE = 10;
	const FALLBACK_WALK_SPEED = 1;
	const jobClient = new JobsClient(fetch);

	let mapPixelWidth = $state(1000);
	let mapPixelHeight = $state(1000);
	let selectedJobId = $state<string | undefined>(undefined);
	let selectedMonsterId = $state<string | undefined>(undefined);
	let isStarting = $state(false);
	let startError = $state<string | undefined>(undefined);
	let jobKindFilter = $state<'all' | 'production' | 'battle'>('all');
	let subtypeFilters = $state<number[]>([]);

	const allJobs = $derived.by(() => {
		const jobs: MapJob[] = [];
		for (const info of productionJobs) {
			const def = info.definition;
			if (!def?.position) continue;
			jobs.push({
				id: def.id,
				kind: 'production',
				subType: def.subType,
				x: def.position.x,
				y: def.position.y,
				definition: def,
				routeInfo: info.routeInfo,
			});
		}
		for (const info of battleJobs) {
			const def = info.definition;
			if (!def?.position) continue;
			jobs.push({
				id: def.id,
				kind: 'battle',
				subType: def.subType,
				x: def.position.x,
				y: def.position.y,
				definition: def,
				routeInfo: info.routeInfo,
			});
		}
		return jobs;
	});

	const visibleJobs = $derived.by(() =>
		allJobs.filter((job) => {
			const matchesKind = jobKindFilter === 'all' || job.kind === jobKindFilter;
			const matchesSubtype = subtypeFilters.length === 0 || subtypeFilters.includes(job.subType);
			return matchesKind && matchesSubtype;
		}),
	);
	const selectedJob = $derived(visibleJobs.find((job) => job.id === selectedJobId));
	const availableMonsters = $derived(monsters.filter((monster) => !monster.participant?.jobEntityId));
	const selectedMonster = $derived(availableMonsters.find((monster) => monster.entity?.id === selectedMonsterId));
	const groupedBySubtype = $derived.by(() => {
		const groups = new Map<JobSubType, { count: number; meta: SubtypeMeta }>();
		for (const job of allJobs) {
			if (jobKindFilter !== 'all' && job.kind !== jobKindFilter) continue;
			const curr = groups.get(job.subType);
			if (curr) {
				curr.count += 1;
				continue;
			}
			groups.set(job.subType, { count: 1, meta: getSubtypeMeta(job.subType, job.kind) });
		}
		return Array.from(groups.entries());
	});

	$effect(() => {
		if (!selectedJobId) return;
		const selectedStillVisible = visibleJobs.some((job) => job.id === selectedJobId);
		if (!selectedStillVisible) {
			clearSelection();
		}
	});

	onMount(() => {
		let app: any;
		let isMounted = true;

		(async () => {
			const PIXI = await import('pixi.js');
			const response = await fetch('/assets/map.json');
			const mapData = await response.json();
			if (!isMounted) return;

			mapPixelWidth = mapData.width * TILE_SIZE;
			mapPixelHeight = mapData.height * TILE_SIZE;

			app = new PIXI.Application();
			await app.init({ width: mapPixelWidth, height: mapPixelHeight });
			if (!isMounted) return;

			const canvasHost = document.getElementById('map-canvas');
			if (canvasHost) {
				canvasHost.innerHTML = '';
				canvasHost.appendChild(app.canvas);
			}

			const textures = await Promise.all(mapData.tileSet.map((tile: { source: string }) => PIXI.Assets.load(`/assets/${tile.source}`)));
			if (!isMounted) return;

			for (let y = 0; y < mapData.height; y++) {
				for (let x = 0; x < mapData.width; x++) {
					const tileId = mapData.layer[y][x];
					const tileInfo = mapData.tileSet.find((t: { tileSetId: number }) => t.tileSetId === tileId);
					if (!tileInfo) continue;

					const texture = textures[mapData.tileSet.indexOf(tileInfo)];
					const sprite = new PIXI.Sprite(texture);
					sprite.width = TILE_SIZE;
					sprite.height = TILE_SIZE;
					sprite.x = x * TILE_SIZE;
					sprite.y = y * TILE_SIZE;
					app.stage.addChild(sprite);
				}
			}
		})();

		return () => {
			isMounted = false;
			app?.destroy(true, { children: true });
		};
	});

	function getSubtypeMeta(subType: JobSubType, kind: MapJobKind): SubtypeMeta {
		switch (subType) {
			case 1:
				return {
					label: 'Woodcutting',
					badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
					pinClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
					icon: TreePine,
				};
			case 2:
				return {
					label: 'Mining',
					badgeClass: 'bg-slate-100 text-slate-800 border border-slate-200',
					pinClass: 'bg-slate-600 hover:bg-slate-700 text-white',
					icon: Pickaxe,
				};
			case 3:
				return {
					label: 'Harvesting',
					badgeClass: 'bg-amber-100 text-amber-900 border border-amber-200',
					pinClass: 'bg-amber-500 hover:bg-amber-600 text-white',
					icon: Wheat,
				};
			case 4:
				return {
					label: 'Fishing',
					badgeClass: 'bg-sky-100 text-sky-800 border border-sky-200',
					pinClass: 'bg-sky-600 hover:bg-sky-700 text-white',
					icon: Fish,
				};
			case 5:
				return {
					label: 'Smelting',
					badgeClass: 'bg-orange-100 text-orange-800 border border-orange-200',
					pinClass: 'bg-orange-600 hover:bg-orange-700 text-white',
					icon: Flame,
				};
			case 7:
				return {
					label: 'Cooking',
					badgeClass: 'bg-rose-100 text-rose-800 border border-rose-200',
					pinClass: 'bg-rose-600 hover:bg-rose-700 text-white',
					icon: ChefHat,
				};
			case 8:
				return {
					label: 'Battle',
					badgeClass: 'bg-red-100 text-red-800 border border-red-200',
					pinClass: 'bg-red-600 hover:bg-red-700 text-white',
					icon: Swords,
				};
			case 9:
				return {
					label: 'Armor Crafting',
					badgeClass: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
					pinClass: 'bg-indigo-600 hover:bg-indigo-700 text-white',
					icon: Shield,
				};
			default:
				return {
					label: kind === 'battle' ? 'Battle' : 'Production',
					badgeClass: 'bg-gray-100 text-gray-800 border border-gray-200',
					pinClass: kind === 'battle' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-cyan-600 hover:bg-cyan-700 text-white',
					icon: kind === 'battle' ? Swords : Factory,
				};
		}
	}

	function getDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
		const dx = a.x - b.x;
		const dy = a.y - b.y;
		return Math.sqrt(dx * dx + dy * dy);
	}

	function estimateWalkSpeed(job: MapJob): number {
		if (!job.routeInfo?.estimatedDuration || !job.routeInfo.distance || job.routeInfo.distance <= 0) {
			return FALLBACK_WALK_SPEED;
		}
		const seconds = protoToMilliseconds(job.routeInfo.estimatedDuration) / 1000;
		if (seconds <= 0) {
			return FALLBACK_WALK_SPEED;
		}
		return job.routeInfo.distance / seconds;
	}

	function estimateMonsterTravel(job: MapJob, monster: Monster): { distance: number; seconds: number } {
		const monsterPos = monster.position;
		if (!monsterPos) {
			return { distance: 0, seconds: 0 };
		}
		const distance = getDistance(monsterPos, { x: job.x, y: job.y });
		const speed = estimateWalkSpeed(job);
		return {
			distance,
			seconds: distance / speed,
		};
	}

	function formatDuration(seconds: number): string {
		if (seconds <= 0) return '0s';
		if (seconds < 60) return `${Math.ceil(seconds)}s`;
		if (seconds < 3600) return `${Math.ceil(seconds / 60)}m`;
		return `${Math.ceil(seconds / 3600)}h`;
	}

	function clearSelection(): void {
		selectedJobId = undefined;
		selectedMonsterId = undefined;
		startError = undefined;
	}

	function toggleSubtypeFilter(subType: number): void {
		if (subtypeFilters.includes(subType)) {
			subtypeFilters = subtypeFilters.filter((s) => s !== subType);
			return;
		}
		subtypeFilters = [...subtypeFilters, subType];
	}

	function clearFilters(): void {
		jobKindFilter = 'all';
		subtypeFilters = [];
	}

	async function startSelectedJob(): Promise<void> {
		if (!selectedJob || !selectedMonster?.entity?.id || !selectedJob.definition?.id) {
			return;
		}
		isStarting = true;
		startError = undefined;
		try {
			if (selectedJob.kind === 'production') {
				await gameStateStore.startJob({
					monsterId: selectedMonster.entity.id,
					jobDefinitionId: selectedJob.definition.id,
				});
			} else {
				await jobClient.startBattleJob({
					userId: userStore.getUser().userId,
					monsterId: selectedMonster.entity.id,
					jobDefinitionId: selectedJob.definition.id,
				});
			}
			clearSelection();
			await invalidateAll();
		} catch (error) {
			startError = error instanceof Error ? error.message : 'Failed to start job';
		} finally {
			isStarting = false;
		}
	}
</script>

<div class="space-y-3">
	<div class="flex flex-wrap items-center gap-2 text-xs">
		<button
			type="button"
			class="rounded-md border px-2 py-1 font-medium {jobKindFilter === 'all'
				? 'border-gray-700 bg-gray-700 text-white'
				: 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'}"
			onclick={() => (jobKindFilter = 'all')}
		>
			All
		</button>
		<button
			type="button"
			class="rounded-md border px-2 py-1 font-medium {jobKindFilter === 'production'
				? 'border-emerald-700 bg-emerald-700 text-white'
				: 'border-emerald-300 bg-white text-emerald-700 hover:border-emerald-400'}"
			onclick={() => (jobKindFilter = 'production')}
		>
			Production
		</button>
		<button
			type="button"
			class="rounded-md border px-2 py-1 font-medium {jobKindFilter === 'battle'
				? 'border-red-700 bg-red-700 text-white'
				: 'border-red-300 bg-white text-red-700 hover:border-red-400'}"
			onclick={() => (jobKindFilter = 'battle')}
		>
			Battle
		</button>

		<div class="mx-1 h-5 w-px bg-gray-300"></div>

		{#each groupedBySubtype as [_, group]}
			<button
				type="button"
				class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 border transition {subtypeFilters.length === 0 || subtypeFilters.includes(_)
					? group.meta.badgeClass
					: 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}"
				onclick={() => toggleSubtypeFilter(_)}
			>
				<group.meta.icon size={12} />
				{group.meta.label} ({group.count})
			</button>
		{/each}

		<button
			type="button"
			class="rounded-md border border-gray-300 bg-white px-2 py-1 text-gray-700 hover:border-gray-400"
			onclick={clearFilters}
		>
			Reset
		</button>
	</div>

	<div class="grid gap-4 lg:grid-cols-[1fr_320px]">
		<div class="relative overflow-hidden rounded-lg border border-gray-300" style="width: {mapPixelWidth}px; height: {mapPixelHeight}px; max-width: 100%;">
			<div id="map-canvas" class="absolute inset-0" aria-hidden="true"></div>

			<div class="absolute inset-0">
				{#each cities as city}
					{#if city.position}
						<div
							class="absolute z-20"
							style="left: {city.position.x * TILE_SIZE}px; top: {city.position.y * TILE_SIZE}px; transform: translate(-50%, -50%);"
							title={city.name}
						>
							<div class="rounded-full border border-amber-300 bg-amber-200 p-1.5 shadow">
								<House class="h-4 w-4" />
							</div>
						</div>
					{/if}
				{/each}

				{#each monsters as monster}
					{#if monster.position}
						<div
							class="absolute z-30"
							style="left: {monster.position.x * TILE_SIZE}px; top: {monster.position.y * TILE_SIZE}px; transform: translate(-50%, -50%);"
							title={monster.identity?.name}
						>
							<div class="rounded-full border border-black/20 bg-white p-1.5 shadow-sm">
								<Sword class="h-4 w-4" />
							</div>
						</div>
					{/if}
				{/each}

				{#each visibleJobs as job}
					{@const meta = getSubtypeMeta(job.subType, job.kind)}
					<button
						type="button"
						class="absolute z-40 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow {meta.pinClass} {selectedJobId === job.id ? 'ring-2 ring-offset-2 ring-black/40' : ''}"
						style="left: {job.x * TILE_SIZE}px; top: {job.y * TILE_SIZE}px; transform: translate(-50%, -50%);"
						onclick={() => {
							selectedJobId = job.id;
							selectedMonsterId = undefined;
							startError = undefined;
						}}
						title={job.definition?.id ?? job.id}
					>
						<meta.icon size={12} />
					</button>
				{/each}
			</div>
		</div>

		<aside class="h-fit rounded-lg border border-gray-200 bg-white p-3">
			{#if selectedJob}
				<JobDefinitionCard
					job={{ definition: selectedJob.definition, routeInfo: selectedJob.routeInfo }}
					itemDefs={items}
					selected={true}
					interactive={false}
					class="mb-3"
				/>

				<div class="mb-2 text-xs font-medium text-gray-600">Available Monsters</div>
				<div class="max-h-56 space-y-1.5 overflow-y-auto pr-1">
					{#if availableMonsters.length === 0}
						<div class="rounded border border-dashed border-gray-300 bg-gray-50 px-2 py-2 text-xs text-gray-500">
							All monsters are currently busy.
						</div>
					{:else}
						{#each availableMonsters as monster}
							{@const eta = estimateMonsterTravel(selectedJob, monster)}
							<button
								type="button"
								class="w-full rounded border px-2 py-1.5 text-left text-xs transition {selectedMonsterId === monster.entity?.id
									? 'border-emerald-300 bg-emerald-50'
									: 'border-gray-200 bg-white hover:border-gray-300'}"
								onclick={() => (selectedMonsterId = monster.entity?.id)}
							>
								<div class="font-medium text-gray-900">{monster.identity?.name}</div>
								<div class="text-gray-600">Lv {monster.stat?.level} | Stamina {monster.stat?.stamina}/{monster.stat?.maxStamina}</div>
								<div class="text-gray-500">Distance {Math.round(eta.distance * 100) / 100}m | ETA {formatDuration(eta.seconds)}</div>
							</button>
						{/each}
					{/if}
				</div>

				{#if startError}
					<div class="mt-2 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">{startError}</div>
				{/if}

				<div class="mt-3 flex gap-2">
					<button
						type="button"
						class="flex-1 rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
						disabled={!selectedMonster || isStarting}
						onclick={startSelectedJob}
					>
						{isStarting ? 'Starting...' : 'Start Job'}
					</button>
					<button
						type="button"
						class="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
						onclick={clearSelection}
					>
						Clear
					</button>
				</div>
			{:else}
				<div class="rounded border border-dashed border-gray-300 bg-gray-50 px-3 py-6 text-sm text-gray-600">
					Select a colored job pin on the map to open start controls.
				</div>
			{/if}
		</aside>
	</div>
</div>
