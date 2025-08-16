<script lang="ts">
	import CardTitle from '$lib/components/ui/card/card-title.svelte';
	import * as Card from '$lib/components/ui/card';
	import { JobsClient } from '$lib/service/jobs';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import MonsterView from '$lib/widgets/monster.svelte';
	import JobView from '$lib/widgets/job.svelte';
	import log from '$lib/log/log.js';
	import { getUserFromContext } from '$lib/stores/user';
	import { invalidateAll } from '$app/navigation';
	import { config } from '$lib/config/config.js';
	import type { Monster } from '../../../../gen/v1/domain_pb.js';
	import type { ProductionJobDefinition } from '../../../../gen/v1/masterdata_pb.js';
	import { protoToMilliseconds } from '$lib/utils/prototime.js';
	import { Duration } from 'luxon';

	let { data } = $props();

	const selectedColor = 'bg-green-200';

	const user = getUserFromContext()!;
	const jobClient = new JobsClient(fetch, config.masterdataBaseUrl);

	let openDialog = $state(false);
	let selectedMonster: Monster | undefined = $state(undefined);
	let selectedJob: ProductionJobDefinition | undefined = $state(undefined);

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
		await jobClient.startJob({
			jobDefinitionId: selectedJob?.id,
			userId: BigInt(user.userId),
			monsterId: BigInt(selectedMonster.entity!.id),
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
		<JobView {job} />
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
				<p>
					{Duration.fromMillis(protoToMilliseconds(job.duration)).shiftTo('seconds').toHuman({ unitDisplay: 'narrow' })}
				</p>
				<div>Stamina Cost</div>
				<p>{job.staminaCost}</p>

				<div>Experience</div>
				<p>{job.rewards?.experience}</p>
			</Card.Content>
		</Card.Root>
	{/each}
</div>

<Button onclick={startJob}>Start Gathering</Button>
