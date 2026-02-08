<script lang="ts">
	import Collapsible from '$lib/components/ui/collapsible/collapsible.svelte';
	import ItemView from '$lib/widgets/item.svelte';

	let { data } = $props();
</script>

<h1>Inventory</h1>
<div class="gap-3">
	{#each data.inventory.cities as city (city.entity!.id)}
		<Collapsible open={true} class="m-3" title={city.entity!.id}>
			<div class="grid grid-cols-4 m-2 gap-3">
				{#each city.inventory!.items! as item (item.id)}
					<ItemView {item} class="bg-secondary text-secondary-foreground w-full" />
				{/each}
			</div>
		</Collapsible>
	{/each}
</div>
