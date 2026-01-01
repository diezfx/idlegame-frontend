<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { cn } from '$lib/utils';
	import { Plus, ArrowLeftRight } from 'lucide-svelte';
	import type { Monster } from '../../gen/v1/domain_pb';
	let {
		monster,
		class: classname,
		itemDeleteAction,
		openEquipDialog,
		...props
	}: {
		monster: Monster;
		class?: string;
		itemDeleteAction?: (itemID: string) => void;
		openEquipDialog?: () => void;
		[key: string]: any;
	} = $props();
</script>

<Card {...props} class={cn(classname)} title={monster.identity?.name}>
	<div class="grid grid-cols-2 items-center gap-y-2">
		<div>ID</div>
		<p>#{monster.entity?.id}</p>
		<div>Level</div>
		<p>{monster.stat?.level}</p>
		<div>HP</div>
		<Progress
			showLabel={true}
			foreground="bg-green-500"
			background="bg-primary/20"
			value={monster.stat?.health!}
			max={monster.stat?.maxHealth!}
		/>

		<div>Experience</div>
		<p>{monster.stat?.experience}</p>
		<div>Stamina</div>
		<Progress
			showLabel={true}
			foreground="bg-yellow-200"
			background="bg-primary/20"
			value={monster.stat?.stamina ?? 0}
			max={monster.stat?.maxStamina ?? 100}
		/>
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
	<div class="col-span-2 grid grid-cols-3 gap-2">
		{#each monster.equippedItems as item (item.id)}
			<div
				class="relative flex aspect-square flex-col items-center justify-center rounded-md border border-gray-200 bg-gray-50 p-2 text-center shadow-sm"
			>
				<span class="w-full truncate text-xs font-medium" title={item.id}>{item.id}</span>
				{#if item.quantity > 1}
					<span class="text-xs text-gray-500">x{item.quantity}</span>
				{/if}
				{#if itemDeleteAction}
					<button
						class="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600 shadow-sm"
						onclick={() => itemDeleteAction(item.id)}
						title="Unequip"
					>
						✕
					</button>
				{/if}
				{#if openEquipDialog}
					<button
						class="absolute bottom-1 left-1/2 -translate-x-1/2 hover:text-gray-800"
						onclick={() => openEquipDialog?.()}
						title="Swap"
					>
						<ArrowLeftRight class="h-5 w-5 text-gray-600" />
					</button>
				{/if}
			</div>
		{/each}
		{#each Array.from({ length: Math.max(0, 3 - monster.equippedItems.length) }) as _}
			<button
				class="flex aspect-square flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50/50 p-2 text-center hover:border-green-400 hover:bg-green-50"
				onclick={() => openEquipDialog?.()}
				title="Equip"
			>
				<Plus class="h-8 w-8 text-green-500" />
			</button>
		{/each}
	</div>
</Card>
