<script lang="ts">
	import type { Job } from '$lib/service/jobs';
	import JobView from '$lib/widgets/job.svelte';

	export let data: { jobs: Job[] };

	console.log(data);
</script>

<h1>Jobs</h1>
<div>
	{#each data.jobs as job}
		<JobView {job} />
	{/each}
</div>

<h1 class="text-3xl font-bold underline">Hello world!</h1>
