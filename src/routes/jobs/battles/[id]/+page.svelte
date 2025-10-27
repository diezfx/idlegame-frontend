<script lang="ts">
	import { page } from '$app/state';
	import { gameStateStore } from '$lib/stores/gamestate.svelte.js';
	import BattlewView from '$lib/widgets/battle.svelte';

	const jobId = BigInt(page.params.id!);

	const battleJobPromise = $derived(gameStateStore.getJob(jobId));
	const battleJob = $derived(await battleJobPromise);
</script>

<div>Battle State</div>
{#if battleJob == undefined}
	Loading Battle...
{:else}
	<BattlewView job={battleJob!} />
{/if}
