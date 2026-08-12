<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { gameStateStore } from '$lib/stores/gamestate.svelte.js';
	import BattleView from '$lib/widgets/battle.svelte';

	const jobId = page.params.id!;

	const battleJob = $derived(gameStateStore.Jobs.get(jobId));
	$effect(() => {
		if (battleJob == undefined) {
			goto('/jobs/battles');
		}
	});
</script>

{#if battleJob}
	<BattleView job={battleJob} />
{/if}
