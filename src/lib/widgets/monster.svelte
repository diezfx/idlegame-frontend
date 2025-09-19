<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { cn } from '$lib/utils';
	import type { Monster } from '../../gen/v1/domain_pb';
	let {
		monster,
		class: classname,
		itemDeleteAction,
		...props
	}: {
		monster: Monster;
		class?: string;
		itemDeleteAction?: (itemID: string) => void;
		[key: string]: any;
	} = $props();
</script>

<Card.Root {...props} class={cn(classname)}>
	<Card.Header>
		<Card.Title>{monster.identity?.name}</Card.Title>
		<!--<Card.Description>Card Description</Card.Description> -->
	</Card.Header>
	<Card.Content>
		<div class="grid grid-cols-2">
			<div>ID</div>
			<p>#{monster.entity?.id}</p>
			<div>Level</div>
			<p>{monster.stat?.level}</p>

			<div>Experience</div>
			<p>{monster.stat?.experience}</p>
			<div>Stamina</div>
			<p>{monster.stat?.stamina}</p>
			<div>Position</div>
			<p>X:{Math.round(monster.position!.x)};Y:{Math.round(monster.position!.y)}</p>

			{#if monster.participant}
				<div>Current Job</div>
				<p>{monster.participant.jobEntityId}</p>
			{:else}
				<div>Current Job</div>
				<p>Idle</p>
			{/if}
		</div>
		<Separator class="col-span-full m-1"></Separator>
		<div class="col-span-2 font-bold">Equipment</div>
		<div class="grid grid-cols-3">
			{#each monster.equippedItems as item}
				<p>{item.id}</p>
				<p>{item.quantity}</p>
				{#if itemDeleteAction}
					<button class="button text-red-500 text-2xl" onclick={() => itemDeleteAction(item.id)}>-</button>
				{/if}
			{/each}
		</div>
	</Card.Content>
</Card.Root>
