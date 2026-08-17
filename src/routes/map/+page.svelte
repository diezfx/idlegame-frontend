<script lang="ts">
	import { gameStateStore } from '$lib/stores/gamestate.svelte';
	import { masterdataStore } from '$lib/stores/masterdata.svelte';
	import Map from '../../lib/components/map.svelte';

	const monsters = $derived(Array.from(gameStateStore.Monsters.values()));
	const [locations, productionJobs, battleJobs] = await Promise.all([
		masterdataStore.getLocations(),
		masterdataStore.getProductionJobs(),
		masterdataStore.getBattleJobs(),
	]);
</script>

<Map {locations} {monsters} {productionJobs} {battleJobs} />
