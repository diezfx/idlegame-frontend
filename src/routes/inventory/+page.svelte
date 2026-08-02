<script lang="ts">
	import Collapsible from '$lib/components/ui/collapsible/collapsible.svelte';
	import { gameStateStore } from '$lib/stores/gamestate.svelte';
	import ItemView from '$lib/widgets/item.svelte';

	const invs = $derived(await gameStateStore.getInventories());
</script>

<h1>Inventory</h1>
<div class="gap-3">
	{#each invs as [id, inv]}
		<Collapsible open={true} class="m-3" title={inv.identity?.name!}>
			<div class="grid grid-cols-4 m-2 gap-3">
				{#each inv.inventory!.items! as item (item.id)}
					<ItemView {item} class="bg-secondary text-secondary-foreground w-full" />
				{/each}
			</div>
		</Collapsible>
	{/each}
</div>
