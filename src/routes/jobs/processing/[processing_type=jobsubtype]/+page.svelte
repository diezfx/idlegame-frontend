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
	import Collapsible from '$lib/components/ui/collapsible/collapsible.svelte';

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

<div class="grid grid-cols-3 gap-4">
	<div>
		<Card class="mb-4 p-4">
			<div class="mt-3 grid grid-cols-2 gap-3">
				<Card
					title="Selected Monster"
					onclick={() => {
						openDialog = true;
					}}
				>
					{#if selectedMonster}
						<Card title={selectedMonster.identity?.name}>
							<div class="grid grid-cols-2 gap-2 text-xs text-foreground">
								<div>
									<span class="text-muted-foreground">Level:</span>
									{selectedMonster.stat?.level}
								</div>
								<div>
									<span class="text-muted-foreground">Stamina:</span>
									{selectedMonster.stat?.stamina}/{selectedMonster.stat?.maxStamina}
								</div>
								<div class="col-span-2">
									<span class="text-muted-foreground">Pos:</span> X:{Math.round(selectedMonster.position?.x ?? 0)} Y:{Math.round(
										selectedMonster.position?.y ?? 0,
									)}
								</div>
							</div>
						</Card>
					{:else}
						<div class="rounded-md border border-dashed border-border bg-muted p-3 text-sm text-muted-foreground">
							No monster selected
						</div>
					{/if}
				</Card>
				<Card title="Selected Job">
					{#if selectedJob}
						<div class="grid grid-cols-2 gap-2 text-xs text-foreground">
							<div><span class="font-medium">ID:</span> {selectedJob.definition?.id}</div>
							<div><span class="font-medium">Stamina:</span> {selectedJob.definition?.staminaCost}</div>
							<div><span class="font-medium">Reward XP:</span> {selectedJob.definition?.rewards?.experience}</div>
						</div>
					{:else}
						<div class="rounded-md border border-dashed border-border bg-muted p-3 text-sm text-muted-foreground">
							No job selected
						</div>
					{/if}
				</Card>
			</div>
			<div class="grid grid-cols-2 gap-2">
				<Button onclick={startJob} disabled={!jobStartable} class="col-span-2 w-auto"
					>Start Gathering</Button
				>
			</div>
		</Card>

		<div class="grid grid-cols-3 gap-3">
			{#each jobDefs as job}
				<JobDefinitionCard {job} selected={isSelectedJob(job.definition!.id)} onclick={() => (selectedJob = job)} />
			{/each}
		</div>
	</div>

	<aside class="sticky top-4 h-fit">
		<Card>
			<div class="mb-2 flex items-center justify-between">
				<h3 class="text-sm font-semibold text-foreground">Active Jobs</h3>
				<span class="rounded-full bg-secondary py-0.5 text-xs font-semibold text-secondary-foreground"
					>{activeJobs.length}</span
				>
			</div>
			<div class="max-h-[75vh] space-y-2 overflow-y-auto">
				{#if activeJobs.length === 0}
					<div class="rounded-md border border-dashed border-border bg-muted p-3 text-sm text-muted-foreground">
						No active jobs
					</div>
				{:else}
					{#each activeJobs as job}
						<JobView
							gs={gameStateStore}
							jobID={job.entity!.id}
							onStop={() => gameStateStore.stopJob(job.entity?.id!)}
							{job}
						/>
					{/each}
				{/if}
			</div>
		</Card>
	</aside>
</div>

<Dialog open={openDialog} class="max-w-5xl" onClose={() => (openDialog = false)}>
	Choose Monster
	<div class="grid grid-cols-3 gap-2">
		{#each monsters as [_, monster]}
			{#if monster.participant == undefined}
				<MonsterView
					gs={gameStateStore}
					onclick={() => dialogClicked(monster.entity?.id!)}
					monId={monster.entity?.id!}
					class="hover:bg-muted"
				/>
			{/if}
		{/each}
	</div>
</Dialog>

<style>
</style>
