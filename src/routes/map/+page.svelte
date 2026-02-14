<script lang="ts">
	import { gameStateStore } from '$lib/stores/gamestate.svelte';
	import { masterdataStore } from '$lib/stores/masterdata.svelte';
	import Map from '../../lib/components/map.svelte';

	const monsters = $derived(Array.from(gameStateStore.Monsters.values()));
	const cities = await masterdataStore.getCities();
</script>

<h1>Map</h1>
<Map {cities} {monsters} />
