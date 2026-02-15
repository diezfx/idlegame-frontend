<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import MonsterView from '$lib/widgets/monster.svelte';
	import JobDefinitionCard from '$lib/widgets/job-definition-card.svelte';
	import JobView from '$lib/widgets/job.svelte';
	import log from '$lib/log/log.js';
	import type { Monster } from '../../../../gen/v1/domain_pb.js';
	import type { ProductionJobInfo } from '../../../../gen/v1/service_pb.js';
	import Dialog from '$lib/components/ui/dialog/dialog.svelte';
	import { gameStateStore } from '$lib/stores/gamestate.svelte.js';
	import { page } from '$app/state';
	import { masterdataStore } from '$lib/stores/masterdata.svelte.js';

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
		<JobDefinitionCard
			job={job}
			selected={isSelectedJob(job.definition!.id)}
			onclick={() => (selectedJob = job)}
		/>
	{/each}
</div>

<div class="mt-4 flex justify-end">
	<Button onclick={startJob} disabled={!jobStartable} class="bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-300">
		Start Gathering
	</Button>
</div>
