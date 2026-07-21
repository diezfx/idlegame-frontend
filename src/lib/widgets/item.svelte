<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import type { Item } from '$lib/service/inventory';
	import { masterdataStore } from '$lib/stores/masterdata.svelte';
	import { cn } from '$lib/utils';
	let { item, class: classname }: { item: Item; class: string } = $props();

	masterdataStore.getItems();
	let mD = $derived(masterdataStore.Items.get(item.id));
</script>

<Card title={mD?.name} class={cn(classname, 'p-1 gap-1 text-center')}>
	<p>{item.quantity}</p>
</Card>
