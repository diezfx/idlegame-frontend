<script lang="ts">
	import type { Inventory } from '$lib/service/inventory';
	import ItemView from '$lib/widgets/item.svelte';

	export let data: { inventory: Inventory };
</script>

<h1>Inventory</h1>
<div class="grid grid-cols-3 gap-4">
	{#each data.inventory.items as item}
		<ItemView {item} class="col-start-2" />
	{/each}
</div>
