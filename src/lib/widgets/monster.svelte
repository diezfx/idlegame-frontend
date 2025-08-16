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

<Card.Root {...props} class={cn(classname, 'card-root')}>
	<Card.Header>
		<Card.Title>{monster.identity?.name}</Card.Title>
	</Card.Header>
	<Card.Content>
		<div class="grid-2-cols">
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
		<Separator class="separator"></Separator>
		<div class="equipment-header">Equipment</div>
		<div class="grid-3-cols">
			{#each monster.equippedItems as item}
				<p>{item.id}</p>
				<p>{item.quantity}</p>
				{#if itemDeleteAction}
					<button class="delete-button" onclick={() => itemDeleteAction(item.id)}>-</button>
				{/if}
			{/each}
		</div>
	</Card.Content>
</Card.Root>

<style>
	.card-root {
		width: 350px;
	}
	.grid-2-cols {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	.grid-3-cols {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
	.separator {
		grid-column: span 2;
		margin: 0.25rem;
	}
	.equipment-header {
		grid-column: span 2;
		font-weight: 700;
	}
	.delete-button {
		color: #ef4444;
		font-size: 1.5rem;
	}
</style>
