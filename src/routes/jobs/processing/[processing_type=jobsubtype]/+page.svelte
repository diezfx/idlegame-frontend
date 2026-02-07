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

	const selectedColor = 'bg-green-200';
	let openDialog = $state(false);
	let selectedId: string | undefined = $state(undefined);
	let selectedJob: ProductionJobInfo | undefined = $state(undefined);

	const processingType = $derived(parseInt(page.params.processing_type!, 10));
	const activeJobsMap = $derived(await gameStateStore.getJobs());
	let activeJobs = $derived(Array.from(activeJobsMap.values()).filter((job) => job.def?.subType === processingType));
	const monsters = $derived(await gameStateStore.getMonsters());
	const jobDefs = $derived(
		(await masterdataStore.getProductionJobs()).filter((job) => job.definition?.subType === processingType),
	);

	let selectedMonster: Monster | undefined = $derived(selectedId ? monsters.get(selectedId) : undefined);

	let jobStartable = $derived(selectedJob && selectedId);
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

<div class="space-y-8 pb-12">
	<!-- Active Jobs Section -->
	{#if activeJobs.length > 0}
		<section>
			<div class="flex items-center gap-2 mb-4 text-gray-800">
				<Activity class="text-green-600" />
<div>Start new Job</div>
<div class="grid grid-cols-3 gap-2">
	{#if selectedMonster != undefined}
		<MonsterView class={selectedColor} gs={gameStateStore} monId={selectedMonster.entity?.id!} />
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
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
<div>Currently active Jobs</div>
<div class="grid grid-cols-3 gap-2">
	{#each activeJobs as job}
		<JobView gs={gameStateStore} jobID={job.entity!.id} onStop={() => gameStateStore.stopJob(job.entity?.id!)} {job} />
	{/each}
				</div>
			{/if}
		{/each}
	Choose Monster
	<div class="grid grid-cols-3 gap-2 items-start">

<div class="grid grid-cols-4 gap-2 items-start">
	{#each jobDefs as job}
		<Card
			class="{isSelectedJob(job.definition!.id)
				? selectedColor
				: ''} max-w-[350px] w-full hover:bg-gray-100 cursor-pointer transition-colors"
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
