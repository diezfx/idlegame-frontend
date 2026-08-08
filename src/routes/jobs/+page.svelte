<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { gameStateStore } from '$lib/stores/gamestate.svelte';
	import { getServicesContext } from '$lib/service/context';
	import JobView from '$lib/widgets/job.svelte';

	const jobs = $derived(gameStateStore.Jobs);
	const { jobs: jobService } = getServicesContext();

	async function stopJob(id: string) {
		await jobService.stopJob(id);
		invalidateAll();
	}
</script>

<h1>Jobs</h1>
<div class="grid grid-cols-3 gap-4">
	{#each jobs as [_, job]}
		<JobView jobID={job.entity!.id} onStop={() => stopJob(job.entity?.id!)} />
	{/each}
</div>
