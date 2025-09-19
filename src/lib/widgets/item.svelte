<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { Item } from '$lib/service/inventory';
	let { item, class: classname }: { item: Item; class: string } = $props();
</script>

<Card.Root class={classname}>
	<Card.Header>
		<Card.Title>{item.id}</Card.Title>
		<!--<Card.Description>Card Description</Card.Description> -->
	</Card.Header>
	<Card.Content>
		<p>{item.quantity}</p>
	</Card.Content>
</Card.Root>
