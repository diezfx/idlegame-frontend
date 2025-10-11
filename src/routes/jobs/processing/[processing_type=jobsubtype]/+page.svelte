<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import { getJobsClientContext, JobsClient } from '$lib/service/jobs';
	import Button from '$lib/components/ui/button/button.svelte';
	import MonsterView from '$lib/widgets/monster.svelte';
	import JobView from '$lib/widgets/job.svelte';
	import log from '$lib/log/log.js';
	import { getUserFromContext } from '$lib/stores/user';
	import { invalidateAll } from '$app/navigation';
	import type { Monster } from '../../../../gen/v1/domain_pb.js';
	import { protoToMilliseconds } from '$lib/utils/prototime.js';
	import { Duration } from 'luxon';
	import type { ProductionJobInfo } from '../../../../gen/v1/service_pb.js';
	import Dialog from '$lib/components/ui/dialog/dialog.svelte';

	let { data } = $props();

	const selectedColor = 'bg-green-200';

	const user = getUserFromContext()!;
	const jobClient = getJobsClientContext();

	let openDialog = $state(false);
	let selectedMonster: Monster | undefined = $state(undefined);
	let selectedJob: ProductionJobInfo | undefined = $state(undefined);

	let jobStartable = $derived(selectedJob && selectedMonster);
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
		await jobClient.startJob({
			jobDefinitionId: selectedJob?.definition!.id,
			userId: BigInt(user.userId),
			monsterId: BigInt(selectedMonster.entity!.id),
		});
		reset();
		invalidateAll();
	}
</script>

<div>Start new Job</div>
<div class="grid grid-cols-3 gap-2">
	{#if selectedMonster != undefined}
		<MonsterView class={selectedColor} monster={selectedMonster} />
	{/if}
	<Card
		onclick={() => {
			console.log('button clicked');
			openDialog = true;
			selectedMonster;
		}}
		class="button text-center text-green-500 text-2xl hover:{selectedColor}">+</Card
	>
</div>

<div>Currently active Jobs</div>
<div class="grid grid-cols-3 gap-2">
	{#each data.jobs as job}
		<JobView {job} />
	{/each}
</div>

<Dialog open={openDialog} class="bg-blue-300 max-w-full" onClose={() => (openDialog = false)}>
	Choose Monster
	<div class="grid grid-cols-3 gap-2">
		{#each data.monsters as monster}
			<MonsterView onclick={() => dialogClicked(monster)} {monster} class="hover:bg-gray-200" />
		{/each}
	</div>
</Dialog>

<div class="grid grid-cols-4 gap-2">
	{#each data.masterdata as job}
		<Card
			class={isSelectedJob(job.definition!.id) ? selectedColor : ''}
			title={job.definition!.id}
			onclick={() => (selectedJob = job)}
		>
			<div class="grid grid-cols-2">
				<p>Required Level</p>
				<p>{job.definition!.levelRequirement}</p>
				<div>Duration</div>
				<p>
					{Duration.fromMillis(protoToMilliseconds(job.definition!.duration))
						.shiftTo('seconds')
						.toHuman({ unitDisplay: 'narrow' })}
				</p>
				<div>Stamina Cost</div>
				<p>{job.definition!.staminaCost}</p>

				<div>Experience</div>
				<p>{job.definition!.rewards?.experience}</p>
				<div>Distance</div>
				<p>{Math.round(job.routeInfo?.distance! * 100) / 100}m</p>
				<div>Estimated Traveltime</div>
				<p>
					{Duration.fromMillis(protoToMilliseconds(job.routeInfo?.estimatedDuration!))
						.shiftTo('seconds')
						.toHuman({ unitDisplay: 'narrow' })}
				</p>
				{#if job.definition!.ingredients.length != 0}
					<div class="text-xl col-span-2">Ingredients</div>
					{#each job.definition!.ingredients as ingredient}
						<p>{ingredient.id}</p>
						<p>{ingredient.quantity}</p>
					{/each}
				{/if}
			</div>
		</Card>
	{/each}
</div>

<Button onclick={startJob} disabled={!jobStartable}>Start Gathering</Button>
