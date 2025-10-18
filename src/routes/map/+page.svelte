<script lang="ts">
	import { gameStateStore } from '$lib/stores/gamestate.svelte';
	import Map from '../../lib/components/map.svelte';

	let { data } = $props();
</script>

<h1>Map</h1>
<Map cities={data.cities} monsters={Array.from((await gameStateStore.getMonsters()).values())} />
