<script lang="ts">
	import BattlewView from '$lib/widgets/battle.svelte';
	import { getConfigContext } from '$lib/config/config';
	import type { Job, BattleJob } from '$lib/service/jobs.js';

	let { data } = $props();
	let battleJob: Job & BattleJob = $derived(data.battleJob);

	const cfg = getConfigContext();
</script>

<h1>Woodcutting</h1>

<div>Battle State</div>
<BattlewView job={battleJob} />
