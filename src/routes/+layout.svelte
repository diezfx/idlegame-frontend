<script>
	import { JobsClient, setJobsClientContext } from '$lib/service/jobs';
	import Nav from '$lib/widgets/nav.svelte';
	import { onMount } from 'svelte';
	import '../app.css';
	import { initializeWasm } from '$lib/stores/wasm';

	onMount(() => {
		initializeWasm();
	});

	console.log('Layout loaded');
	let { children } = $props();
	setJobsClientContext(new JobsClient(fetch));
</script>

<div class="flex min-h-screen bg-background">
	<Nav />
	<main class="flex-1 p-2">
		{@render children()}
	</main>
</div>
