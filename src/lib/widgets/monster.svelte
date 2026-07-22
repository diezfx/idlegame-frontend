<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { cn } from '$lib/utils';
	import { Plus, ArrowLeftRight } from 'lucide-svelte';
	import { gameStateStore, type GameStateStore } from '$lib/stores/gamestate.svelte';
	import { JobSubType } from '$gen/v1/masterdata_pb';
	import DescriptionList from '$lib/components/ui/descriptionlist/DescriptionList.svelte';
	import DescriptionRow from '$lib/components/ui/descriptionlist/DescriptionRow.svelte';
	let {
		monId,
		class: classname,
		itemDeleteAction,
		openEquipDialog,
		...props
	}: {
		monId: string;
		class?: string;
		itemDeleteAction?: (itemID: string) => void;
		openEquipDialog?: () => void;
		[key: string]: any;
	} = $props();

	const gs = gameStateStore;
	const monster = $derived(gs.Monsters.get(monId));
	const monJob = $derived(monster?.participant?.jobEntityId ? gs.Jobs.get(monster.participant.jobEntityId) : undefined);
</script>

{#if monster}
	<Card {...props} class={cn(classname)} title={monster.identity?.name}>
		<DescriptionList>
			<DescriptionRow term={'Level'}>{monster.stat?.level}</DescriptionRow>
			<DescriptionRow term={'HP'}>
				<Progress
					class="w-full"
					showLabel={true}
					foreground="bg-green-500"
					background="bg-primary/20"
					value={monster.stat?.health!}
					max={monster.stat?.maxHealth!}
				/>
			</DescriptionRow>
			<DescriptionRow term={'Stamina'}>
				<Progress
					class="w-full"
					showLabel={true}
					foreground="bg-yellow-200"
					background="bg-primary/20"
					value={monster.stat?.stamina ?? 0}
					max={monster.stat?.maxStamina ?? 100}
				/></DescriptionRow
			>
			<DescriptionRow term="Exp">{monster.stat?.experience}</DescriptionRow>
			<DescriptionRow term="Stats">
				<div class="grid grid-cols-4 gap-1 text-[10px]">
					<span class="rounded bg-red-50 px-1 py-0.5 text-center">STR {monster.stat?.strength ?? 0}</span>
					<span class="rounded bg-amber-50 px-1 py-0.5 text-center">AGI {monster.stat?.agility ?? 0}</span>
					<span class="rounded bg-blue-50 px-1 py-0.5 text-center">INT {monster.stat?.intelligence ?? 0}</span>
					<span class="rounded bg-emerald-50 px-1 py-0.5 text-center">VIT {monster.stat?.vitality ?? 0}</span>
				</div></DescriptionRow
			>
			<DescriptionRow term="Job">
				{#if monJob}
					{JobSubType[monJob.def?.subType!]}
				{:else}
					Idle
				{/if}</DescriptionRow
			>
			<DescriptionRow term="Pos">X:{Math.round(monster.position!.x)};Y:{Math.round(monster.position!.y)}</DescriptionRow
			>
		</DescriptionList>
		<div class="col-span-2 grid grid-cols-3 justify-items-center gap-2">
			<div class="col-span-3 justify-self-start font-bold uppercase tracking-wider">Equipment</div>
			{#each monster.equippedItems as item (item.id)}
				<div>
					<span class="w-full truncate text-[9px] font-medium leading-tight" title={item.id}>{item.id}</span>
					{#if item.quantity > 1}
						<span class="text-[9px] text-gray-500 leading-tight">x{item.quantity}</span>
					{/if}
					{#if itemDeleteAction}
						<button
							class="absolute -right-1.5 -top-1.5 hidden group-hover:flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white hover:bg-red-600 shadow-sm z-10"
							onclick={(e) => {
								e.stopPropagation();
								itemDeleteAction(item.id);
							}}
							title="Unequip"
						>
							✕
						</button>
					{/if}
					{#if openEquipDialog}
						<button
							class="absolute bottom-0 left-1/2 -translate-x-1/2 hidden group-hover:block hover:text-gray-800 bg-white/80 rounded-full p-0.5"
							onclick={(e) => {
								e.stopPropagation();
								openEquipDialog?.();
							}}
							title="Swap"
						>
							<ArrowLeftRight class="h-3 w-3 text-gray-600" />
						</button>
					{/if}
				</div>
			{/each}
			{#each Array.from({ length: Math.max(0, 3 - monster.equippedItems.length) }) as _}
				<button
					disabled={openEquipDialog == undefined}
					class="h-12 w-12 bg-secondary justify-items-center {openEquipDialog
						? 'hover:border-green-400 hover:bg-green-50'
						: ''}"
					onclick={(e) => {
						e.stopPropagation();
						openEquipDialog?.();
					}}
					title="Equip"
				>
					<Plus class="h-6 w-6 text-green-500" />
				</button>
			{/each}
		</div>
	</Card>
{/if}
