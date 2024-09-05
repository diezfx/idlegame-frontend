<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { Monster } from '$lib/service/monsters';
	let { monster, class: classname }: { monster: Monster; class: string } = $props();
</script>

<Card.Root class="${classname} w-[350px]">
	<Card.Header>
		<Card.Title>{monster.name}</Card.Title>
		<!--<Card.Description>Card Description</Card.Description> -->
	</Card.Header>
	<Card.Content class="grid grid-cols-2">
		<div>ID</div>
		<p>#{monster.id}</p>
		<div>Level</div>
		<p>{monster.level}</p>

		<div>Experience</div>
		<p>{monster.experience}</p>
	</Card.Content>
</Card.Root>
