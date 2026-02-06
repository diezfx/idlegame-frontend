<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { gameStateStore } from '$lib/stores/gamestate.svelte';
	import JobView from '$lib/widgets/job.svelte';

	const jobs = await gameStateStore.getJobs();

	async function stopJob(id: string) {
		await gameStateStore.stopJob(id);
		invalidateAll();
	}
</script>

<h1>Jobs</h1>
<div class="grid grid-cols-3 gap-4">
	{#each jobs as [_, job]}
		<JobView gs={gameStateStore} jobID={job.entity!.id} onStop={() => stopJob(job.entity?.id!)} />
	{/each}
</div>
