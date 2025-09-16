<script lang="ts">
	import Map from '../../lib/components/map.svelte';

	let { data } = $props();
</script>

<h1>Map</h1>
<Map cities={data.cities} monsters={data.monsters} />
