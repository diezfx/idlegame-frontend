<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import JobView from '$lib/widgets/job.svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { gameStateStore } from '$lib/stores/gamestate.svelte.js';
	import { getServicesContext } from '$lib/service/context.js';
	import { JobSubType } from '$gen/v1/masterdata_pb.js';
	import { masterdataStore } from '$lib/stores/masterdata.svelte.js';
	import JobSelection from '$lib/widgets/job-selection.svelte';
	import { resolve } from '$app/paths';

	let { data } = $props();
	const { battles: battleService, jobs: jobService } = getServicesContext();

	const jobDefs = $derived(
		(await masterdataStore.getBattleJobs()).filter((job) => job.definition?.subType === JobSubType.BATTLE),
	);

	const activeJobs = $derived(
		Array.from(gameStateStore.Jobs.values()).filter((job) => jobDefs.find((j) => job.definitionId == j.definition?.id)),
	);

	async function startJob(selection: { jobDefinitionId: string; monsterId: string }): Promise<void> {
		await battleService.startBattle(selection);
		invalidateAll();
	}
</script>

<div class="grid gap-4 lg:grid-cols-3">
	<div class="lg:col-span-2">
		<JobSelection jobs={data.masterdata} startLabel="Start Battle" onStart={startJob} />
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
					{#each activeJobs as job (job.entity?.id)}
						<JobView
							onStop={() => jobService.stopJob(job.entity!.id)}
							jobID={job.entity!.id}
							onclick={() => goto(resolve('/jobs/battles/[id]', { id: job.entity!.id }))}
						/>
					{/each}
				{/if}
			</div>
		</Card>
	</aside>
</div>
