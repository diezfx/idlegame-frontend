<script lang="ts">
	import { EntityType } from '$gen/v1/domain_pb';
	import Collapsible from '$lib/components/ui/collapsible/collapsible.svelte';
	import { gameStateStore } from '$lib/stores/gamestate.svelte';
	import ItemView from '$lib/widgets/item.svelte';

	const allInvs = $derived(await gameStateStore.getInventories());
	const invs = $derived(
		allInvs
			.values()
			.filter((x) => x.entity?.entityType == EntityType.LOCATION_INVENTORY)
			.toArray(),
	);
</script>

<h1>Inventory</h1>
<div class="gap-3">
	{#each invs as inv}
		<Collapsible open={true} class="m-3" title={inv.identity?.name!}>
			<div class="grid grid-cols-4 m-2 gap-3">
				{#each inv.inventory!.items! as item (item.id)}
					<ItemView {item} class="bg-secondary text-secondary-foreground w-full" />
				{/each}
			</div>
		</Collapsible>
	{/each}
</div>
