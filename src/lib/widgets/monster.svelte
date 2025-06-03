<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import type { Monster } from '$lib/service/monsters';
	import { cn } from '$lib/utils';
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

<Card.Root {...props} class={cn(classname, 'w-[350px]')}>
	<Card.Header>
		<Card.Title>{monster.name}</Card.Title>
		<!--<Card.Description>Card Description</Card.Description> -->
	</Card.Header>
	<Card.Content>
		<div class="grid grid-cols-2">
			<div>ID</div>
			<p>#{monster.id}</p>
			<div>Level</div>
			<p>{monster.level}</p>

			<div>Experience</div>
			<p>{monster.experience}</p>
			<div>Stamina</div>
			<p>{monster.stamina}</p>
			{#if monster.jobId}
				<div>Current Job</div>
				<p>{monster.jobId}</p>
			{:else}
				<div>Current Job</div>
				<p>Idle</p>
			{/if}
		</div>
		<Separator class="col-span-full m-1"></Separator>
		<div class="col-span-2 font-bold">Equipment</div>
		<div class="grid grid-cols-3">
			{#each monster.equippedItems as item}
				<p>{item.itemId}</p>
				<p>{item.quantity}</p>
				{#if itemDeleteAction}
					<button class="button text-red-500 text-2xl" onclick={() => itemDeleteAction(item.itemId)}>-</button>
				{/if}
			{/each}
		</div>
	</Card.Content>
</Card.Root>
