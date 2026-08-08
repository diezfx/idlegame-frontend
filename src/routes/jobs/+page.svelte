<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { gameStateStore } from '$lib/stores/gamestate.svelte';
	import { stopJob as stopJobMutation } from '$lib/service/jobs';
	import JobView from '$lib/widgets/job.svelte';

	const jobs = $derived(gameStateStore.Jobs);

	async function stopJob(id: string) {
		await stopJobMutation(id);
		invalidateAll();
	}
</script>

<h1>Jobs</h1>
<div class="grid grid-cols-3 gap-4">
	{#each jobs as [_, job]}
		<JobView jobID={job.entity!.id} onStop={() => stopJob(job.entity?.id!)} />
	{/each}
</div>
