<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { House, Sword } from 'lucide-svelte';
	import type { CityDefinition, JobSubType } from '../../gen/v1/masterdata_pb';
	import type { Monster } from '../../gen/v1/domain_pb';
	import type { BattleJobInfo, ProductionJobInfo } from '../../gen/v1/service_pb';
	import { protoToMilliseconds } from '$lib/utils/prototime';
	import { gameStateStore } from '$lib/stores/gamestate.svelte';
	import { getServicesContext } from '$lib/service/context';
	import JobDefinitionCard from '$lib/widgets/job-definition-card.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import MultiSelect from '$lib/components/ui/multi-select/multi-select.svelte';

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
		[key: string]: unknown;
	} = $props();

	const TILE_SIZE = 10;
	const FALLBACK_WALK_SPEED = 1;
	const { jobs: jobService, battles: battleService } = getServicesContext();

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
	const groupedBySubtype = $derived.by(() => {
		const groups = new Map<JobSubType, { count: number; meta: SubtypeMeta }>();
		for (const job of allJobs) {
			const curr = groups.get(job.subType);
			if (curr) {
				curr.count += 1;
				continue;
			}
			groups.set(job.subType, { count: 1, meta: getSubtypeMeta(job.subType) });
		}
		return Array.from(groups.entries());
	});
	const subtypeOptions = $derived(
		groupedBySubtype.map(([value, group]) => ({ value, label: group.meta.label, count: group.count })),
	);

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

			const textures = await Promise.all(
				mapData.tileSet.map((tile: { source: string }) => PIXI.Assets.load(`/assets/${tile.source}`)),
			);
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

	function getSubtypeMeta(subType: JobSubType): SubtypeMeta {
		switch (subType) {
			case 1:
				return { label: 'Woodcutting' };
			case 2:
				return { label: 'Mining' };
			case 3:
				return { label: 'Harvesting' };
			case 4:
				return { label: 'Fishing' };
			case 5:
				return { label: 'Smelting' };
			case 7:
				return { label: 'Cooking' };
			case 8:
				return { label: 'Battle' };
			case 9:
				return { label: 'Armor Crafting' };
			default:
				return { label: 'Production' };
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

<div class="space-y-3">
	<MultiSelect label="Jobs" options={subtypeOptions} bind:selected={subtypeFilters} />

	<div class="grid grid-cols-[minmax(0,1fr)_16rem] gap-4">
		<div
			class="relative overflow-hidden rounded-lg border border-border"
			style="width: {mapPixelWidth}px; height: {mapPixelHeight}px; max-width: 100%;"
		>
			<div id="map-canvas" class="absolute inset-0" aria-hidden="true"></div>

			<div class="absolute inset-0">
				{#each cities as city}
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

				{#each monsters as monster}
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

				{#each visibleJobs as job}
					<button
						type="button"
						class="absolute z-40 h-6 w-6 rounded-full border-2 border-white shadow {job.kind === 'battle'
							? 'bg-red-600 hover:bg-red-700'
							: 'bg-blue-600 hover:bg-blue-700'} {selectedJobId === job.id ? 'ring-2 ring-offset-2 ring-black/40' : ''}"
						style="left: {job.x * TILE_SIZE}px; top: {job.y * TILE_SIZE}px; transform: translate(-50%, -50%);"
						onclick={() => {
							selectedJobId = job.id;
							selectedMonsterId = undefined;
							startError = undefined;
						}}
						title={job.definition?.id ?? job.id}
					></button>
				{/each}
			</div>
		</div>

		<aside class="h-fit rounded-lg border border-border bg-card p-3">
			{#if selectedJob}
				<JobDefinitionCard
					job={{ definition: selectedJob.definition, routeInfo: selectedJob.routeInfo }}
					selected={true}
					interactive={false}
					class="mb-3"
				/>

				<div class="mb-2 text-xs font-medium text-muted-foreground">Available Monsters</div>
				<div class="max-h-56 space-y-1.5 overflow-y-auto pr-1">
					{#if availableMonsters.length === 0}
						<div class="rounded border border-dashed border-border bg-muted px-2 py-2 text-xs text-muted-foreground">
							All monsters are currently busy.
						</div>
					{:else}
						{#each availableMonsters as monster}
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

				<div class="mt-3 flex gap-2">
					<Button
						class="flex-1 text-sm font-medium"
						disabled={!selectedMonster || isStarting}
						onclick={startSelectedJob}
					>
						{isStarting ? 'Starting...' : 'Start Job'}
					</Button>
					<button
						type="button"
						class="rounded border border-border px-3 py-2 text-sm text-foreground hover:bg-muted"
						onclick={clearSelection}
					>
						Clear
					</button>
				</div>
			{:else}
				<div class="rounded border border-dashed border-border bg-muted px-3 py-6 text-sm text-muted-foreground">
					Select a colored job pin on the map to open start controls.
				</div>
			{/if}
		</aside>
	</div>
</div>
