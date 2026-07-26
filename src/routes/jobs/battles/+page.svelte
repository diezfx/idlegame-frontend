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

	const selectedColor = 'bg-green-200';

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

<div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] items-start">
	<div>
		<div>Start new Job</div>
		<div class="grid grid-cols-3 gap-2">
			{#if selectedMonster != undefined}
				<MonsterView class={selectedColor} monId={selectedMonster.entity?.id!} />
			{/if}
			<Card
				onclick={() => {
					openDialog = true;
					selectedMonster;
				}}
				class="button text-center text-green-500 text-2xl hover:{selectedColor}"
				>+
			</Card>
		</div>

		<div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
			{#each data.masterdata as job}
				<JobDefinitionCard {job} selected={isSelectedJob(job.definition!.id)} onclick={() => (selectedJob = job)} />
			{/each}
		</div>

		<div class="mt-4">
			<Button onclick={startJob}>Start Battle</Button>
		</div>
	</div>

	<aside class="xl:sticky xl:top-4 h-fit">
		<div class="rounded-xl border border-gray-200 bg-white p-3">
			<div class="mb-2 flex items-center justify-between">
				<h3 class="text-sm font-semibold text-gray-900">Active Jobs</h3>
				<span class="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">{activeJobs.size}</span>
			</div>
			<div class="max-h-[75vh] space-y-2 overflow-y-auto pr-1">
				{#if activeJobs.size === 0}
					<div class="rounded-md border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-500">
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
		</div>
	</aside>
</div>

<Dialog open={openDialog} class="max-w-5xl" onClose={() => (openDialog = false)}>
	Choose Monster
	<div class="grid grid-cols-3 gap-2 items-start">
		{#each monsters as [_, monster]}
			<MonsterView onclick={() => dialogClicked(monster)} monId={monster.entity?.id!} class="hover:bg-gray-200" />
		{/each}
	</div>
</Dialog>
