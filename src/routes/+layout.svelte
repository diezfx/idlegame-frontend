<script>
	import { JobsClient, setJobsClientContext } from '$lib/service/jobs';
	import Nav from '$lib/widgets/nav.svelte';
	import '../app.css';

	console.log('Layout loaded');
	let { data, children } = $props();
	setJobsClientContext(new JobsClient(fetch));
</script>

<div class="flex">
	<Nav />
	<main class="flex-1 p-2">
		{@render children()}
	</main>
</div>
