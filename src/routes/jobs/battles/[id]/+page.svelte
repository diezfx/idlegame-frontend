<script lang="ts">
	import { page } from '$app/state';
	import { gameStateStore } from '$lib/stores/gamestate.svelte.js';
	import BattlewView from '$lib/widgets/battle.svelte';

	const jobId = page.params.id!;

	const battleJob = $derived(gameStateStore.Jobs.get(jobId));

</script>

<div>Battle State</div>

{#if battleJob === undefined || battleJob === null}
	Loading...
{:else}
	<BattlewView job={battleJob} />
{/if}
