<script>
	import { JobsClient, setJobsClientContext } from '$lib/service/jobs';
	import { setUserContext } from '$lib/stores/user';
	import Nav from '$lib/widgets/nav.svelte';
	import '../app.css';

	let { data, children } = $props();

	setUserContext(data.user);
	setJobsClientContext(new JobsClient(fetch, data.config.masterdataBaseUrl));
</script>

<Nav />
<div class="container">
	{@render children()}
</div>
