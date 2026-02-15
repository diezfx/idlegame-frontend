<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
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

<Card {...props} class={cn(classname, 'w-[350px]')} title={monster.name}>
	<div class="grid grid-cols-2">
		<div>ID</div>
		<p>#{monster.id}</p>
		<div>Element</div>
		<p>{MonsterElement[monster.element]}</p>
		<div>STR</div>
		<p>{monster.strength}</p>
		<div>AGI</div>
		<p>{monster.agility}</p>
		<div>INT</div>
		<p>{monster.intelligence}</p>
		<div>VIT</div>
		<p>{monster.vitality}</p>
	</div>
</Card>
