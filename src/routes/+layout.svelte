<script>
	import { JobsClient, setJobsClientContext } from '$lib/service/jobs';
	import { setUserContext } from '$lib/stores/user';
	import Nav from '$lib/widgets/nav.svelte';
	import '../app.css';

	let { data, children } = $props();

	setUserContext(data.user);
	setJobsClientContext(new JobsClient(fetch));
</script>

<div class="flex">
	<Nav />
	<main class="flex-1 p-2">
		{@render children()}
	</main>
</div>
