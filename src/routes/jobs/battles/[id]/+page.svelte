<script lang="ts">
	import { page } from '$app/state';
	import { gameStateStore } from '$lib/stores/gamestate.svelte.js';
	import BattleView from '$lib/widgets/battle.svelte';

	const jobId = page.params.id!;

	const battleJob = $derived(gameStateStore.Jobs.get(jobId));
</script>

{#if battleJob === undefined || battleJob === null}
	Loading...
{:else}
	<BattleView job={battleJob} />
{/if}
