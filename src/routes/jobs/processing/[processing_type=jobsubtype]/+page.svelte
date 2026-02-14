<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import MonsterView from '$lib/widgets/monster.svelte';
	import JobView from '$lib/widgets/job.svelte';
	import log from '$lib/log/log.js';
	import type { Monster } from '../../../../gen/v1/domain_pb.js';
	import { protoToMilliseconds } from '$lib/utils/prototime.js';
	import { Duration } from 'luxon';
	import type { ProductionJobInfo } from '../../../../gen/v1/service_pb.js';
	import Dialog from '$lib/components/ui/dialog/dialog.svelte';
	import { gameStateStore } from '$lib/stores/gamestate.svelte.js';
	import { page } from '$app/state';
	import { masterdataStore } from '$lib/stores/masterdata.svelte.js';
	import { JobSubType } from '$gen/v1/masterdata_pb';
	import { TreePine, Cog, FlaskConical, Hammer, Soup, Footprints } from 'lucide-svelte';

	const selectedColor = 'bg-green-200';
	let openDialog = $state(false);
	let selectedId: string | undefined = $state(undefined);
	let selectedJob: ProductionJobInfo | undefined = $state(undefined);

	const processingType = $derived(parseInt(page.params.processing_type!, 10));
	const activeJobsMap = $derived(gameStateStore.Jobs);
	let activeJobs = $derived(Array.from(activeJobsMap.values()).filter((job) => job.def?.subType === processingType));
	const monsters = $derived(gameStateStore.Monsters);
	const jobDefs = $derived(
		(await masterdataStore.getProductionJobs()).filter((job) => job.definition?.subType === processingType),
	);
	const itemDefs = await masterdataStore.getItems();

	let selectedMonster: Monster | undefined = $derived(selectedId ? monsters.get(selectedId) : undefined);

	let jobStartable = $derived(selectedJob && selectedId);
	function dialogClicked(m: string): void {
		openDialog = false;
		selectedId = m;
	}
	function reset(): void {
		selectedId = undefined;
		selectedJob = undefined;
	}

	function isSelectedJob(jobID: string): boolean {
		return selectedJob?.definition!.id == jobID;
	}

	function visualForSubtype(subType: JobSubType) {
		if (subType === JobSubType.WOODCUTTING || subType === JobSubType.WOODWORKING) {
			return {
				icon: TreePine,
				chip: 'WOOD',
				chipClass: 'bg-emerald-600 text-white',
				iconClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
				highlight: 'ring-1 ring-emerald-200/80'
			};
		}
		if (subType === JobSubType.SMELTING || subType === JobSubType.WEAPON_CRAFTING || subType === JobSubType.ARMOR_CRAFTING) {
			return {
				icon: Hammer,
				chip: 'METAL',
				chipClass: 'bg-slate-700 text-white',
				iconClass: 'bg-slate-100 text-slate-700 border-slate-200',
				highlight: ''
			};
		}
		if (subType === JobSubType.FOOD_PROCESSING || subType === JobSubType.COOKING) {
			return {
				icon: Soup,
				chip: 'FOOD',
				chipClass: 'bg-orange-600 text-white',
				iconClass: 'bg-orange-100 text-orange-700 border-orange-200',
				highlight: ''
			};
		}
		if (subType === JobSubType.HARVESTING || subType === JobSubType.FISHERY) {
			return {
				icon: FlaskConical,
				chip: 'MATERIAL',
				chipClass: 'bg-cyan-700 text-white',
				iconClass: 'bg-cyan-100 text-cyan-700 border-cyan-200',
				highlight: ''
			};
		}
		return {
			icon: Cog,
			chip: 'PROCESS',
			chipClass: 'bg-gray-700 text-white',
			iconClass: 'bg-gray-100 text-gray-700 border-gray-200',
			highlight: ''
		};
	}

	function woodLogoForSubtype(subType: JobSubType): string | null {
		if (subType === JobSubType.WOODCUTTING) return '/logos/woodcutting.png';
		if (subType === JobSubType.WOODWORKING) return '/logos/woodworking.png';
		return null;
	}

	async function startJob(): Promise<void> {
		if (selectedJob == undefined || selectedMonster == undefined) {
			log.error('No job or monster selected');
			return;
		}
		await gameStateStore.startJob({
			jobDefinitionId: selectedJob?.definition!.id,
			monsterId: selectedMonster.entity!.id,
		});
		reset();
		//invalidateAll();
	}
</script>

<section class="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<div class="text-xs font-semibold uppercase tracking-wider text-emerald-700">Setup</div>
			<h2 class="text-lg font-semibold text-gray-900">Create Gathering Job</h2>
			<p class="text-sm text-gray-600">Select monster and recipe below, then start.</p>
		</div>
	</div>
	<div class="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
		<button
			type="button"
			class="min-h-[180px] rounded-lg border border-emerald-200 bg-white p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40"
			onclick={() => {
				openDialog = true;
			}}
		>
			<div class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Selected Monster</div>
			{#if selectedMonster}
				<div class="grid gap-2 rounded-md border border-emerald-200 bg-emerald-50/60 p-3 text-sm">
					<div class="font-semibold text-gray-900">{selectedMonster.identity?.name}</div>
					<div class="grid grid-cols-2 gap-2 text-xs text-gray-700">
						<div>
							<span class="text-gray-500">Level:</span> {selectedMonster.stat?.level}
						</div>
						<div>
							<span class="text-gray-500">Stamina:</span> {selectedMonster.stat?.stamina}/{selectedMonster.stat?.maxStamina}
						</div>
						<div class="col-span-2">
							<span class="text-gray-500">Pos:</span> X:{Math.round(selectedMonster.position?.x ?? 0)} Y:{Math.round(
								selectedMonster.position?.y ?? 0,
							)}
						</div>
					</div>
					<div class="text-[11px] text-emerald-700">Click to change monster</div>
				</div>
			{:else}
				<div class="rounded-md border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-500">
					No monster selected, click to choose
				</div>
			{/if}
		</button>
		<div class="rounded-lg border border-emerald-200 bg-white p-3">
			<div class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Selected Job</div>
			{#if selectedJob}
				<div class="space-y-1 text-sm text-gray-700">
					<div><span class="font-medium">ID:</span> {selectedJob.definition?.id}</div>
					<div><span class="font-medium">Stamina:</span> {selectedJob.definition?.staminaCost}</div>
					<div><span class="font-medium">Reward XP:</span> {selectedJob.definition?.rewards?.experience}</div>
				</div>
			{:else}
				<div class="rounded-md border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-500">
					No job selected
				</div>
			{/if}
		</div>
	</div>
</section>

<div>Currently active Jobs</div>
<div class="grid grid-cols-3 gap-2">
	{#each activeJobs as job}
		<JobView gs={gameStateStore} jobID={job.entity!.id} onStop={() => gameStateStore.stopJob(job.entity?.id!)} {job} />
	{/each}
</div>

<Dialog open={openDialog} class="max-w-5xl" onClose={() => (openDialog = false)}>
	Choose Monster
	<div class="grid grid-cols-3 gap-2 items-start">
		{#each monsters as [_, monster]}
			{#if monster.participant == undefined}
				<MonsterView
					gs={gameStateStore}
					onclick={() => dialogClicked(monster.entity?.id!)}
					monId={monster.entity?.id!}
					class="hover:bg-gray-200"
				/>
			{/if}
		{/each}
	</div>
</Dialog>

<div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 items-start">
	{#each jobDefs as job}
		{@const visual = visualForSubtype(job.definition?.subType ?? JobSubType.UNSPECIFIED)}
		{@const woodLogo = woodLogoForSubtype(job.definition?.subType ?? JobSubType.UNSPECIFIED)}
		<Card
			class="{isSelectedJob(job.definition!.id)
				? 'ring-2 ring-emerald-300 bg-emerald-50/40 border-emerald-200'
				: ''} {visual.highlight} w-full hover:border-emerald-200 hover:shadow-md cursor-pointer transition-all duration-150"
			onclick={() => (selectedJob = job)}
		>
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						{#if woodLogo}
							<img src={woodLogo} alt="wood logo" class="h-8 w-8 rounded-md border border-emerald-200 bg-white object-contain p-1" />
						{:else}
							<span class="inline-flex h-8 w-8 items-center justify-center rounded-md border {visual.iconClass}">
								<visual.icon size={16} />
							</span>
						{/if}
						<div class="font-semibold tracking-tight text-gray-900">{job.definition!.id}</div>
					</div>
					<span class="rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide {visual.chipClass}">{visual.chip}</span>
				</div>

				<div class="grid grid-cols-2 gap-2 text-sm">
					<div class="rounded-md border border-gray-200 bg-white px-2 py-1.5">
						<div class="text-[11px] uppercase text-gray-500">Required Lv</div>
						<div class="font-semibold">{job.definition!.levelRequirement}</div>
					</div>
					<div class="rounded-md border border-gray-200 bg-white px-2 py-1.5">
						<div class="text-[11px] uppercase text-gray-500">Stamina</div>
						<div class="font-semibold">{job.definition!.staminaCost}</div>
					</div>
					<div class="rounded-md border border-gray-200 bg-white px-2 py-1.5">
						<div class="text-[11px] uppercase text-gray-500">Duration</div>
						<div class="font-semibold">
							{Duration.fromMillis(protoToMilliseconds(job.definition!.duration))
								.shiftTo('seconds')
								.toHuman({ unitDisplay: 'narrow' })}
						</div>
					</div>
				</div>

				<div class="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-700">
					<span class="inline-flex items-center gap-1"><Footprints size={13} /> Travel</span>
					<span class="text-right">
						<span class="font-medium">{Math.round(job.routeInfo?.distance! * 100) / 100}m</span>
						<span class="mx-1 text-gray-400">/</span>
						<span>
							{Duration.fromMillis(protoToMilliseconds(job.routeInfo?.estimatedDuration!))
								.shiftTo('seconds')
								.toHuman({ unitDisplay: 'narrow' })}
						</span>
					</span>
				</div>
				<div class="space-y-1.5">
					<div class="text-xs font-semibold uppercase tracking-wider text-gray-600">Rewards</div>
					<div class="flex flex-wrap gap-1.5">
						<span class="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-800">
							XP
							<span class="rounded bg-emerald-100 px-1 py-0.5 text-[10px]">+{job.definition!.rewards?.experience}</span>
						</span>
						{#each job.definition!.rewards?.items ?? [] as rewardItem}
							<span class="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs">
								<span class="font-medium">{itemDefs.get(rewardItem.id)?.name ?? rewardItem.id}</span>
								<span class="rounded bg-gray-100 px-1 py-0.5 text-[10px]">x{rewardItem.quantity}</span>
							</span>
						{/each}
					</div>
				</div>
				{#if job.definition!.ingredients.length != 0}
					<div class="space-y-1.5">
						<div class="text-xs font-semibold uppercase tracking-wider text-gray-600">Ingredients</div>
						<div class="flex flex-wrap gap-1.5">
							{#each job.definition!.ingredients as ingredient}
								<span class="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs">
									<span class="font-medium">{itemDefs.get(ingredient.id)?.name ?? ingredient.id}</span>
									<span class="rounded bg-gray-100 px-1 py-0.5 text-[10px]">x{ingredient.quantity}</span>
								</span>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</Card>
	{/each}
</div>

<div class="mt-4 flex justify-end">
	<Button onclick={startJob} disabled={!jobStartable} class="bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-300">
		Start Gathering
	</Button>
</div>
