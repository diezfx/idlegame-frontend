<script lang="ts">
	import { invalidate, invalidateAll } from '$app/navigation';
	import { getJobsClientContext, type Job } from '$lib/service/jobs';
	import JobView from '$lib/widgets/job.svelte';

	export let data: { jobs: Job[] };

	const jobsClient = getJobsClientContext();

	function stopJob(id: number) {
		jobsClient.stopJob(id);
		invalidateAll();
	}
</script>

<h1>Jobs</h1>
<div class="grid grid-cols-3 gap-4">
	{#each data.jobs as job}
		<JobView {job} onclick={() => stopJob(job.id)} />
	{/each}
</div>
