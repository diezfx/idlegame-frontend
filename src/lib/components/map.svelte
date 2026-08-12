<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { House, Sword, X } from 'lucide-svelte';
	import { JobSubType, type CityDefinition } from '../../gen/v1/masterdata_pb';
	import type { Monster } from '../../gen/v1/domain_pb';
	import type { BattleJobInfo, ProductionJobInfo } from '../../gen/v1/service_pb';
	import { protoToMilliseconds } from '$lib/utils/prototime';
	import { getServicesContext } from '$lib/service/context';
	import JobDefinitionCard from '$lib/widgets/job-definition-card.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import MultiSelect from '$lib/components/ui/multi-select/multi-select.svelte';

	type MapJob = {
		id: string;
		kind: 'production' | 'battle';
		subType: JobSubType;
		x: number;
		y: number;
		definition: ProductionJobInfo['definition'] | BattleJobInfo['definition'];
		routeInfo: ProductionJobInfo['routeInfo'] | BattleJobInfo['routeInfo'];
	};

	type MapData = {
		width: number;
		height: number;
		tileSet: { tileSetId: number; source: string }[];
		layer: number[][];
	};

	let {
		monsters,
		cities,
		productionJobs,
		battleJobs,
	}: {
		monsters: Monster[];
		cities: CityDefinition[];
		productionJobs: ProductionJobInfo[];
		battleJobs: BattleJobInfo[];
	} = $props();

	const TILE_SIZE = 10;
	const FALLBACK_WALK_SPEED = 1;
	const SUBTYPE_LABELS: Partial<Record<JobSubType, string>> = {
		[JobSubType.WOODCUTTING]: 'Woodcutting',
		[JobSubType.MINING]: 'Mining',
		[JobSubType.HARVESTING]: 'Harvesting',
		[JobSubType.FISHING]: 'Fishing',
		[JobSubType.SMELTING]: 'Smelting',
		[JobSubType.WOODWORKING]: 'Woodworking',
		[JobSubType.FISHERY]: 'Fishery',
		[JobSubType.FOOD_PROCESSING]: 'Food Processing',
		[JobSubType.COOKING]: 'Cooking',
		[JobSubType.WEAPON_CRAFTING]: 'Weapon Crafting',
		[JobSubType.ARMOR_CRAFTING]: 'Armor Crafting',
		[JobSubType.BATTLE]: 'Battle',
		[JobSubType.TRANSPORT]: 'Transport',
	};
	const { jobs: jobService, battles: battleService } = getServicesContext();

	let canvas: HTMLCanvasElement;
	let mapPixelWidth = $state(1000);
	let mapPixelHeight = $state(1000);
	let selectedJobId = $state<string | undefined>(undefined);
	let selectedMonsterId = $state<string | undefined>(undefined);
	let isStarting = $state(false);
	let startError = $state<string | undefined>(undefined);
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
		allJobs.filter((job) => subtypeFilters.length === 0 || subtypeFilters.includes(job.subType)),
	);
	const selectedJob = $derived(visibleJobs.find((job) => job.id === selectedJobId));
	const availableMonsters = $derived(monsters.filter((monster) => !monster.participant?.jobEntityId));
	const selectedMonster = $derived(availableMonsters.find((monster) => monster.entity?.id === selectedMonsterId));
	const subtypeOptions = $derived.by(() => {
		const counts: Record<number, number> = {};
		for (const job of allJobs) {
			counts[job.subType] = (counts[job.subType] ?? 0) + 1;
		}
		return Object.entries(counts).map(([value, count]) => {
			const subType = Number(value) as JobSubType;
			return { value: subType, count, label: SUBTYPE_LABELS[subType] ?? 'Production' };
		});
	});

	$effect(() => {
		if (!selectedJobId) return;
		const selectedStillVisible = visibleJobs.some((job) => job.id === selectedJobId);
		if (!selectedStillVisible) {
			clearSelection();
		}
	});

	onMount(() => {
		let app: import('pixi.js').Application | undefined;
		let cancelled = false;

		async function renderMap(): Promise<void> {
			const PIXI = await import('pixi.js');
			const response = await fetch('/assets/map.json');
			if (!response.ok) throw new Error(`Could not load map (${response.status})`);
			const mapData = (await response.json()) as MapData;
			if (cancelled) return;

			mapPixelWidth = mapData.width * TILE_SIZE;
			mapPixelHeight = mapData.height * TILE_SIZE;

			const nextApp = new PIXI.Application();
			await nextApp.init({ canvas, width: mapPixelWidth, height: mapPixelHeight, antialias: false });
			if (cancelled) {
				nextApp.destroy(false, { children: true });
				return;
			}
			app = nextApp;

			const textureEntries = await Promise.all(
				mapData.tileSet.map(
					async (tile) => [tile.tileSetId, await PIXI.Assets.load(`/assets/${tile.source}`)] as const,
				),
			);
			if (cancelled) return;
			const textures = new Map(textureEntries);
			const terrain = new PIXI.Container();

			for (const [y, row] of mapData.layer.entries()) {
				for (const [x, tileId] of row.entries()) {
					const texture = textures.get(tileId);
					if (!texture) continue;
					const sprite = new PIXI.Sprite(texture);
					sprite.setSize(TILE_SIZE);
					sprite.x = x * TILE_SIZE;
					sprite.y = y * TILE_SIZE;
					terrain.addChild(sprite);
				}
			}
			app.stage.addChild(terrain);
		}

		void renderMap().catch((error) => console.error('Failed to render map', error));

		return () => {
			cancelled = true;
			app?.destroy(false, { children: true });
		};
	});

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

	async function startSelectedJob(): Promise<void> {
		if (!selectedJob || !selectedMonster?.entity?.id || !selectedJob.definition?.id) {
			return;
		}
		isStarting = true;
		startError = undefined;
		try {
			if (selectedJob.kind === 'production') {
				await jobService.startJob({
					monsterId: selectedMonster.entity.id,
					jobDefinitionId: selectedJob.definition.id,
				});
			} else {
				await battleService.startBattle({
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

<div class="relative h-[calc(100vh-1rem)] min-h-96 overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
	<div class="absolute inset-0 overflow-auto">
		<div class="relative" style="width: {mapPixelWidth}px; height: {mapPixelHeight}px;">
			<canvas bind:this={canvas} class="absolute inset-0" aria-hidden="true"></canvas>

			<div class="pointer-events-none absolute inset-0">
				{#each cities as city (city.id)}
					{#if city.position}
						<div
							class="absolute z-20"
							style="left: {city.position.x * TILE_SIZE}px; top: {city.position.y *
								TILE_SIZE}px; transform: translate(-50%, -50%);"
							title={city.name}
						>
							<div class="rounded-full border border-amber-300 bg-amber-200 p-1.5 shadow">
								<House class="h-4 w-4" />
							</div>
						</div>
					{/if}
				{/each}

				{#each monsters as monster (monster.entity?.id)}
					{#if monster.position}
						<div
							class="absolute z-30"
							style="left: {monster.position.x * TILE_SIZE}px; top: {monster.position.y *
								TILE_SIZE}px; transform: translate(-50%, -50%);"
							title={monster.identity?.name}
						>
							<div class="rounded-full border border-black/20 bg-card p-1.5 shadow-sm">
								<Sword class="h-4 w-4" />
							</div>
						</div>
					{/if}
				{/each}

				{#each visibleJobs as job (job.id)}
					<button
						type="button"
						class="pointer-events-auto absolute z-40 h-6 w-6 rounded-full border-2 border-white shadow {job.kind ===
						'battle'
							? 'bg-red-600 hover:bg-red-700'
							: 'bg-blue-600 hover:bg-blue-700'} {selectedJobId === job.id ? 'ring-2 ring-offset-2 ring-black/40' : ''}"
						style="left: {job.x * TILE_SIZE}px; top: {job.y * TILE_SIZE}px; transform: translate(-50%, -50%);"
						onclick={() => {
							selectedJobId = job.id;
							selectedMonsterId = undefined;
							startError = undefined;
						}}
						title={job.definition?.name ?? job.id}
						aria-label={`Select ${job.definition?.name ?? 'job'}`}
					></button>
				{/each}
			</div>
		</div>
	</div>

	<div class="absolute left-3 top-3 z-50 rounded-md shadow-lg sm:left-4 sm:top-4">
		<MultiSelect label="Jobs" options={subtypeOptions} bind:selected={subtypeFilters} />
	</div>

	{#if selectedJob}
		<aside
			class="absolute inset-x-3 bottom-3 z-50 max-h-[calc(100%-5rem)] overflow-y-auto rounded-lg border border-border bg-card/95 p-3 shadow-xl backdrop-blur-sm sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-4 sm:w-72"
		>
			<div class="mb-3 flex items-start gap-2">
				<div class="min-w-0 flex-1">
					<JobDefinitionCard
						job={{ definition: selectedJob.definition, routeInfo: selectedJob.routeInfo }}
						selected={true}
						interactive={false}
					/>
				</div>
				<button
					type="button"
					class="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
					onclick={clearSelection}
					aria-label="Close job details"
				>
					<X class="h-4 w-4" />
				</button>
			</div>

			<div class="mb-2 text-xs font-medium text-muted-foreground">Available Monsters</div>
			<div class="max-h-56 space-y-1.5 overflow-y-auto pr-1">
				{#if availableMonsters.length === 0}
					<div class="rounded border border-dashed border-border bg-muted px-2 py-2 text-xs text-muted-foreground">
						All monsters are currently busy.
					</div>
				{:else}
					{#each availableMonsters as monster (monster.entity?.id)}
						{@const eta = estimateMonsterTravel(selectedJob, monster)}
						<button
							type="button"
							class="w-full rounded border px-2 py-1.5 text-left text-xs transition {selectedMonsterId ===
							monster.entity?.id
								? 'border-primary/40 bg-secondary'
								: 'border-border bg-card hover:border-border'}"
							onclick={() => (selectedMonsterId = monster.entity?.id)}
						>
							<div class="font-medium text-foreground">{monster.identity?.name}</div>
							<div class="text-muted-foreground">
								Lv {monster.stat?.level} | Stamina {monster.stat?.stamina}/{monster.stat?.maxStamina}
							</div>
							<div class="text-muted-foreground">
								Distance {Math.round(eta.distance * 100) / 100}m | ETA {formatDuration(eta.seconds)}
							</div>
						</button>
					{/each}
				{/if}
			</div>

			{#if startError}
				<div class="mt-2 rounded border border-destructive/30 bg-destructive/10 px-2 py-1 text-xs text-destructive">
					{startError}
				</div>
			{/if}

			<div class="mt-3">
				<Button class="w-full text-sm font-medium" disabled={!selectedMonster || isStarting} onclick={startSelectedJob}>
					{isStarting ? 'Starting...' : 'Start Job'}
				</Button>
			</div>
		</aside>
	{/if}
</div>
