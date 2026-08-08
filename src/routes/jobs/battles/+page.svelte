<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import { JobsClient } from '$lib/service/jobs';
	import Button from '$lib/components/ui/button/button.svelte';
	import MonsterView from '$lib/widgets/monster.svelte';
	import JobDefinitionCard from '$lib/widgets/job-definition-card.svelte';
	import JobView from '$lib/widgets/job.svelte';
	import log from '$lib/log/log.js';
	import { userStore } from '$lib/stores/user.svelte.js';
	import { goto, invalidateAll } from '$app/navigation';
	import type { Monster } from '../../../gen/v1/domain_pb.js';
	import Dialog from '$lib/components/ui/dialog/dialog.svelte';
	import type { BattleJobInfo } from '../../../gen/v1/service_pb.js';
	import { gameStateStore } from '$lib/stores/gamestate.svelte.js';

	let { data } = $props();

	const selectedColor = 'bg-primary/20';

	const user = userStore.getUser();
	const activeJobs = $derived(gameStateStore.Jobs);
	const monsters = $derived(gameStateStore.Monsters);
	const jobClient = new JobsClient(fetch);

	let openDialog = $state(false);
	let selectedMonster: Monster | undefined = $state(undefined);
	let selectedJob: BattleJobInfo | undefined = $state(undefined);

	function dialogClicked(m: Monster): void {
		openDialog = false;
		selectedMonster = m;
	}
	function reset(): void {
		selectedMonster = undefined;
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
		await jobClient.startBattleJob({
			jobDefinitionId: selectedJob?.definition!.id,
			userId: user.userId,
			monsterId: selectedMonster.entity!.id,
		});
		reset();
		invalidateAll();
	}
</script>

<div class="grid gap-4 lg:grid-cols-3">
	<div class="lg:col-span-2">
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
				<Button
					onclick={startJob}
					disabled={selectedJob == undefined || selectedMonster == undefined}
					class="col-span-2 w-auto">Start Battle</Button
				>
			</div>
		</Card>

		<div class="mt-4 grid grid-cols-3 gap-3">
			{#each data.masterdata as job}
				<JobDefinitionCard {job} selected={isSelectedJob(job.definition!.id)} onclick={() => (selectedJob = job)} />
			{/each}
		</div>

		<div class="mt-4">
			<Button onclick={startJob}>Start Battle</Button>
		</div>
	</div>

	<aside class="sticky top-4 h-fit">
		<Card class="p-3">
			<div class="mb-2 flex items-center justify-between">
				<h3 class="text-sm font-semibold text-foreground">Active Jobs</h3>
				<span class="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">{activeJobs.size}</span>
			</div>
			<div class="max-h-[75vh] space-y-2 overflow-y-auto pr-1">
				{#if activeJobs.size === 0}
					<div class="rounded-md border border-dashed border-border bg-muted p-3 text-sm text-muted-foreground">
						No active jobs
					</div>
				{:else}
					{#each activeJobs as [_, job]}
						<JobView
							onStop={() => gameStateStore.stopJob(job.entity?.id!)}
							jobID={job.entity!.id}
							onclick={() => goto(`/jobs/battles/${job.entity?.id!}`)}
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
			<MonsterView onclick={() => dialogClicked(monster)} monId={monster.entity?.id!} class="hover:bg-muted" />
		{/each}
	</div>
</Dialog>
