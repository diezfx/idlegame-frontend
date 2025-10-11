<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import { JobsClient } from '$lib/service/jobs';
	import Button from '$lib/components/ui/button/button.svelte';
	import MonsterView from '$lib/widgets/monster.svelte';
	import JobView from '$lib/widgets/job.svelte';
	import log from '$lib/log/log.js';
	import { getUserFromContext } from '$lib/stores/user';
	import { invalidateAll } from '$app/navigation';
	import type { Monster } from '../../../gen/v1/domain_pb.js';
	import Dialog from '$lib/components/ui/dialog/dialog.svelte';
	import { protoToMilliseconds } from '$lib/utils/prototime.js';
	import { Duration } from 'luxon';
	import type { BattleJobInfo } from '../../../gen/v1/service_pb.js';
	import { cn } from '$lib/utils.js';

	let { data } = $props();

	const selectedColor = 'bg-green-200';

	const user = getUserFromContext()!;
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
			openDialog = true;
			selectedMonster;
		}}
		class="button text-center text-green-500 text-2xl hover:{selectedColor}"
		>+
	</Card>
</div>

<div>Currently active Jobs</div>
<div class="grid grid-cols-3 gap-2">
	{#each data.jobs as job}
		<JobView {job} onStop={() => jobClient.stopJob(job.entity!.id)} />
	{/each}
</div>

<Dialog open={openDialog} onClose={() => (openDialog = false)}>
	<h2>Choose Monster</h2>
	<div class="grid grid-cols-3 gap-2">
		{#each data.monsters as monster}
			<MonsterView onclick={() => dialogClicked(monster)} {monster} class="hover:bg-gray-200" />
		{/each}
	</div>
</Dialog>

<div class="grid grid-cols-4 gap-2">
	{#each data.masterdata as job}
		<Card
			title={job.definition!.id}
			class={cn(isSelectedJob(job.definition!.id) ? selectedColor : 'hover:bg-accent', 'cursor-pointer')}
			onclick={() => (selectedJob = job)}
		>
			<div class="grid grid-cols-2">
				<p>Required Level</p>
				<p>{job.definition!.levelRequirement}</p>
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
			</div>
		</Card>
	{/each}
</div>

<Button onclick={startJob}>Start Battle</Button>
