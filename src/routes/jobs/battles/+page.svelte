<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import MonsterView from '$lib/widgets/monster.svelte';
	import JobDefinitionCard from '$lib/widgets/job-definition-card.svelte';
	import JobView from '$lib/widgets/job.svelte';
	import log from '$lib/log/log.js';
	import { goto, invalidateAll } from '$app/navigation';
	import type { Monster } from '../../../gen/v1/domain_pb.js';
	import Dialog from '$lib/components/ui/dialog/dialog.svelte';
	import type { BattleJobInfo } from '../../../gen/v1/service_pb.js';
	import { gameStateStore } from '$lib/stores/gamestate.svelte.js';
	import { getServicesContext } from '$lib/service/context.js';
	import { JobSubType } from '$gen/v1/masterdata_pb.js';
	import DescriptionList from '$lib/components/ui/descriptionlist/DescriptionList.svelte';
	import DescriptionRow from '$lib/components/ui/descriptionlist/DescriptionRow.svelte';
	import { masterdataStore } from '$lib/stores/masterdata.svelte.js';

	let { data } = $props();
	const { battles: battleService, jobs: jobService } = getServicesContext();

	const jobDefs = $derived(
		(await masterdataStore.getBattleJobs()).filter((job) => job.definition?.subType === JobSubType.BATTLE),
	);

	const activeJobs = $derived(
		Array.from(gameStateStore.Jobs.values()).filter((job) => jobDefs.find((j) => job.definitionId == j.definition?.id)),
	);
	const monsters = $derived(gameStateStore.Monsters);

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
		await battleService.startBattle({
			jobDefinitionId: selectedJob?.definition!.id,
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
					class="min-h-[8.5rem]"
					onclick={() => {
						openDialog = true;
					}}
				>
					<div class="grid min-h-[6rem] items-center">
						{#if selectedMonster}
							<DescriptionList class="w-full">
								<DescriptionRow term="Name">{selectedMonster.identity?.name}</DescriptionRow>
								<DescriptionRow term="Level">{selectedMonster.stat?.level}</DescriptionRow>
								<DescriptionRow term="Stamina">
									{selectedMonster.stat?.stamina}/{selectedMonster.stat?.maxStamina}
								</DescriptionRow>
								<DescriptionRow term="Position">
									X:{Math.round(selectedMonster.position?.x ?? 0)} Y:{Math.round(selectedMonster.position?.y ?? 0)}
								</DescriptionRow>
							</DescriptionList>
						{:else}
							<div class="w-full text-center">No monster selected</div>
						{/if}
					</div>
				</Card>
				<Card title="Selected Job" class="min-h-[8.5rem]">
					<div class="grid min-h-[6rem] items-center">
						{#if selectedJob}
							<DescriptionList class="w-full">
								<DescriptionRow term="ID">{selectedJob.definition?.id}</DescriptionRow>
								<DescriptionRow term="Stamina">{selectedJob.definition?.staminaCost}</DescriptionRow>
								<DescriptionRow term="Reward XP">{selectedJob.definition?.rewards?.experience}</DescriptionRow>
							</DescriptionList>
						{:else}
							<div class="w-full text-center">No job selected</div>
						{/if}
					</div>
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
				<span class="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive"
					>{activeJobs.length}</span
				>
			</div>
			<div class="max-h-[75vh] space-y-2 overflow-y-auto pr-1">
				{#if activeJobs.length === 0}
					<div class="rounded-md border border-dashed border-border bg-muted p-3 text-sm text-muted-foreground">
						No active jobs
					</div>
				{:else}
					{#each activeJobs as job}
						<JobView
							onStop={() => jobService.stopJob(job.entity?.id!)}
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
