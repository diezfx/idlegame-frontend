<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import type { Item } from '$lib/service/inventory';
	let { item, class: classname }: { item: Item; class: string } = $props();
</script>

<Card title={item.id} class={classname}>
	<p>{item.quantity}</p>
</Card>
