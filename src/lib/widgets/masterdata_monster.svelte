<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { cn } from '$lib/utils';
	import { MonsterElement, type MonsterDefinition } from '../../gen/v1/masterdata_pb';
	let {
		monster,
		class: classname,
		itemDeleteAction,
		...props
	}: {
		monster: MonsterDefinition;
		class?: string;
		itemDeleteAction?: (itemID: string) => void;
		[key: string]: any;
	} = $props();
</script>

<Card.Root {...props} class={cn(classname, 'w-[350px]')}>
	<Card.Header>
		<Card.Title>{monster.name}</Card.Title>
		<!--<Card.Description>Card Description</Card.Description> -->
	</Card.Header>
	<Card.Content>
		<div class="grid grid-cols-2">
			<div>ID</div>
			<p>#{monster.id}</p>
			<div>Element</div>
			<p>{MonsterElement[monster.element]}</p>
			<div>Max Health</div>
			<p>{monster.maxHealth}</p>
			<div>Max Stamina</div>
			<p>{monster.maxStamina}</p>
		</div>
	</Card.Content>
</Card.Root>
