<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { getJobsClientContext } from '$lib/service/jobs';
	import JobView from '$lib/widgets/job.svelte';
	import type { Job } from '../../gen/v1/domain_pb';

	export let data: { jobs: Job[] };

	const jobsClient = getJobsClientContext();

	function stopJob(id: bigint) {
		jobsClient.stopJob(id);
		invalidateAll();
	}
</script>

<h1>Jobs</h1>
<div class="grid grid-cols-3 gap-4">
	{#each data.jobs as job}
		<JobView {job} onStop={() => stopJob(job.entity?.id!)} />
	{/each}
</div>
