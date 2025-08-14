<script lang="ts">
	import BattlewView from '$lib/widgets/battle.svelte';
	import type { Job } from '../../../../gen/v1/domain_pb.js';

	let { data } = $props();
	let battleJob: Job = $derived(data.battleJob);
</script>

<h1>Woodcutting</h1>

<div>Battle State</div>
<BattlewView job={battleJob} />
