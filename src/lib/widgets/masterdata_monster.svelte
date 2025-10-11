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
		<div>Max Health</div>
		<p>{monster.maxHealth}</p>
		<div>Max Stamina</div>
		<p>{monster.maxStamina}</p>
	</div>
</Card>
