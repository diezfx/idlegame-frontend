<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { Item } from '$lib/service/inventory';
	let { item, class: classname }: { item: Item; class: string } = $props();
</script>

<Card.Root class="{classname} card-root">
	<Card.Header>
		<Card.Title>{item.id}</Card.Title>
	</Card.Header>
	<Card.Content class="card-content">
		<div>Quantity</div>
		<p>{item.quantity}</p>
	</Card.Content>
</Card.Root>

<style>
	.card-root {
		width: 350px;
	}
	.card-content {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
</style>
