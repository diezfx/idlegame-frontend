<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { gameStateStore } from '$lib/stores/gamestate.svelte.js';
	import BattlewView from '$lib/widgets/battle.svelte';

	const jobId = BigInt(page.params.id!);

	const battleJobPromise = $derived(gameStateStore.getJob(jobId));
	const battleJob = $derived(await battleJobPromise);

	$effect(() => {
		console.log('battleJob', battleJob);
		if (battleJob === null) {
			goto('/jobs/battles');
		}
	});
</script>

<div>Battle State</div>

{#if battleJob === undefined || battleJob === null}
	Loading...
{:else}
	<BattlewView job={battleJob} />
{/if}
