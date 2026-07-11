<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import type { Item } from '$lib/service/inventory';
	import { masterdataStore } from '$lib/stores/masterdata.svelte';
	let { item, class: classname }: { item: Item; class: string } = $props();

	masterdataStore.getItems();
	let mD = $derived(masterdataStore.Items.get(item.id));
</script>

<Card title={mD?.name} class={classname}>
	<p>{item.quantity}</p>
</Card>
