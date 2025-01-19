<script>
	import { setConfigContext } from '$lib/config/config';
	import { JobsClient, setJobsClientContext } from '$lib/service/jobs';
	import { setUserContext } from '$lib/stores/user';
	import Nav from '$lib/widgets/nav.svelte';
	import '../app.css';

	let { data, children } = $props();

	setUserContext(data.user);
	setConfigContext(data.config);
	setJobsClientContext(new JobsClient(fetch, data.config.jobsClientCfg));
</script>

<Nav />
<div class="container">
	{@render children()}
</div>
