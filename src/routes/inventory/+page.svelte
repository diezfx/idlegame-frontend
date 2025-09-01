<script lang="ts">
	import ItemView from '$lib/widgets/item.svelte';
	import type { Item } from '../../gen/v1/domain_pb';

	export let data: { inventory: Item[] };
</script>

<h1>Inventory</h1>
<div class="grid grid-cols-3 gap-4">
	{#each data.inventory as item}
		<ItemView {item} class="col-start-2" />
	{/each}
</div>
