<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import JobView from '$lib/widgets/job.svelte';
	import { gameStateStore } from '$lib/stores/gamestate.svelte.js';
	import { getServicesContext } from '$lib/service/context.js';
	import { page } from '$app/state';
	import { masterdataStore } from '$lib/stores/masterdata.svelte.js';
	import JobSelection from '$lib/widgets/job-selection.svelte';

	const { jobs: jobService } = getServicesContext();

	const processingType = $derived(parseInt(page.params.processing_type!, 10));
	const activeJobsMap = $derived(gameStateStore.Jobs);
	const jobDefs = $derived(
		(await masterdataStore.getProductionJobs()).filter((job) => job.definition?.subType === processingType),
	);
	let activeJobs = $derived(
		Array.from(activeJobsMap.values()).filter(
			(job) => jobDefs.find((j) => j.definition?.id == job.definitionId)?.definition?.subType === processingType,
		),
	);
	async function startJob(selection: { jobDefinitionId: string; monsterId: string }): Promise<void> {
		await jobService.startJob(selection);
	}
</script>

<div class="grid gap-4 lg:grid-cols-3">
	<div class="content lg:col-span-2">
		<JobSelection jobs={jobDefs} startLabel="Start Gathering" onStart={startJob} />
	</div>

	<aside class="sticky top-2 h-fit">
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
					{#each activeJobs as job (job.entity?.id)}
						<JobView jobID={job.entity!.id} onStop={() => jobService.stopJob(job.entity!.id)} />
					{/each}
				{/if}
			</div>
		</Card>
	</aside>
</div>
