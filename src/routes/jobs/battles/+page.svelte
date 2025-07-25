<script lang="ts">
	import CardTitle from '$lib/components/ui/card/card-title.svelte';
	import * as Card from '$lib/components/ui/card';
	import { JobsClient, type Job, type JobMasterdata } from '$lib/service/jobs';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import MonsterView from '$lib/widgets/monster.svelte';
	import JobView from '$lib/widgets/job.svelte';
	import type { Monster } from '$lib/service/monsters';
	import { getConfigContext } from '$lib/config/config';
	import log from '$lib/log/log.js';
	import { getUserFromContext } from '$lib/stores/user';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	const selectedColor = 'bg-green-200';

	const cfg = getConfigContext();
	const user = getUserFromContext()!;
	const jobClient = new JobsClient(fetch, cfg.jobsClientCfg);

	let openDialog = $state(false);
	let selectedMonster: Monster | undefined = $state(undefined);
	let selectedJob: JobMasterdata | undefined = $state(undefined);

	function dialogClicked(m: Monster): void {
		openDialog = false;
		selectedMonster = m;
	}
	function reset(): void {
		selectedMonster = undefined;
		selectedJob = undefined;
	}

	function isSelectedJob(jobID: string): boolean {
		return selectedJob?.id == jobID;
	}

	async function startJob(): Promise<void> {
		if (selectedJob == undefined || selectedMonster == undefined) {
			log.error('No job or monster selected');
			return;
		}
		await jobClient.startBattleJob({
			jobDefId: selectedJob?.id,
			userId: user.userId,
			monster: selectedMonster.id,
		});
		reset();
		invalidateAll();
	}
</script>

<h1>Woodcutting</h1>

<div>Start new Job</div>
<div class="grid grid-cols-3 gap-2">
	{#if selectedMonster != undefined}
		<MonsterView class={selectedColor} monster={selectedMonster} />
	{/if}
	<Card.Root
		onclick={() => {
			openDialog = true;
			selectedMonster;
		}}
		class="button text-center text-green-500 text-2xl hover:{selectedColor}">+</Card.Root
	>
</div>

<div>Currently active Jobs</div>
<div class="grid grid-cols-3 gap-2">
	{#each data.jobs as job}
		<JobView {job} onStop={() => jobClient.stopJob(job.id)} />
	{/each}
</div>

<Dialog.Root open={openDialog} onOpenChange={() => (openDialog = false)}>
	<Dialog.Trigger>Open</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Chose Monster</Dialog.Title>
		</Dialog.Header>

		{#each data.monsters as monster}
			<MonsterView onclick={() => dialogClicked(monster)} {monster} class="hover:bg-gray-200" />
		{/each}
	</Dialog.Content>
</Dialog.Root>

<div class="grid grid-cols-4 gap-2">
	{#each data.masterdata as job}
		<Card.Root class={isSelectedJob(job.id) ? selectedColor : ''} onclick={() => (selectedJob = job)}>
			<Card.Header>
				<Card.Title>{job.name}</Card.Title>
			</Card.Header>

			<Card.Content class="grid grid-cols-2">
				<p>Required Level</p>
				<p>{job.levelRequirement}</p>
				<div>Duration</div>
				<p>{job.duration}</p>
				<div>Stamina Cost</div>
				<p>{job.staminaCost}</p>

				<div>Experience</div>
				<p>{job.rewards.experience}</p>
			</Card.Content>
		</Card.Root>
	{/each}
</div>

<Button onclick={startJob}>Start Battle</Button>
