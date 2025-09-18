<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import ItemView from '$lib/widgets/item.svelte';
	import type { Item } from '../../gen/v1/domain_pb';

	let { data } = $props();
</script>

<h1>Inventory</h1>
<div class="grid grid-cols-3 gap-4">
	{#each data.inventory.cities as city}
		<Collapsible.Root class="col-span-3">
			<Collapsible.Trigger>
				<h2 class="text-2xl">{city.id}</h2>
			</Collapsible.Trigger>
			<Collapsible.Content>
				{#each city.inventory?.items! as item}
					<ItemView {item} class="" />
				{/each}
			</Collapsible.Content>
		</Collapsible.Root>
	{/each}
</div>
