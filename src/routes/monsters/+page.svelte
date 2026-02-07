<script lang="ts">
	import MonsterView from '$lib/widgets/monster.svelte';
	import log from '$lib/log/log';
	import type { Item, Monster } from '../../gen/v1/domain_pb.js';
	import Dialog from '$lib/components/ui/dialog/dialog.svelte';
	import { gameStateStore } from '$lib/stores/gamestate.svelte.js';
	import { masterdataStore } from '$lib/stores/masterdata.svelte.js';
	import { EffectType } from '$gen/v1/masterdata_pb.js';

	let openDialog = $state(false);
	let selectedMonster: Monster | undefined = $state(undefined);
	let selectedItem: Item | undefined = $state(undefined);
	let itemAmount = $state(1);
	let monsters = await gameStateStore.getMonsters();

	let itemMasterdata = await masterdataStore.getItems();

	let inventory = (await gameStateStore.getInventories()).values().next().value!;

	let equippableItems = $derived(
		inventory.items.filter((i) => {
			return itemMasterdata.get(i.id)?.effects.length ?? 0 > 0;
		}),
	);

	function reset(): void {
		selectedMonster = undefined;
		selectedItem = undefined;
		itemAmount = 1;
	}

	// make a call to api to equip item
	function dialogClicked(item: Item): void {
		openDialog = false;
		console.log('dialogClicked', item);
		if (selectedMonster == undefined) {
			log.error('No monster selected');
			return;
		}
		gameStateStore.equipItem({
			monsterId: selectedMonster.entity!.id,
			itemId: item.id,
			quantity: itemAmount,
		});
		reset();
	}

	async function itemDeleteAction(monsterId: string, itemId: string): Promise<void> {
		await gameStateStore.unEquipItem({
			monsterId: monsterId,
			itemId: itemId,
		});
		log.info('itemDeleteAction', { itemId });
	}
</script>

<h1>Monsters</h1>
<div class="grid grid-cols-3 gap-4">
	{#each monsters as [_, monster]}
		<div class="gap-2">
			<MonsterView
				gs={gameStateStore}
				monId={monster.entity?.id!}
				itemDeleteAction={(itemID) => itemDeleteAction(monster.entity!.id, itemID)}
				openEquipDialog={() => {
					selectedMonster = monster;
					openDialog = true;
				}}
			></MonsterView>
		</div>
	{/each}
</div>

<Dialog open={openDialog} class="max-w-3xl" onClose={() => (openDialog = false)}>
	<div class="flex flex-col gap-4 w-[720px] max-w-full">
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-semibold">Equip Item</h2>
			<button class="text-sm text-gray-600 hover:text-gray-900" onclick={() => (openDialog = false)}> Close </button>
		</div>

		<div class="grid gap-2 sm:grid-cols-2 max-h-[360px] overflow-y-auto">
			{#each equippableItems as item}
				<button
					onclick={() => (selectedItem = item)}
					class="flex flex-col gap-1 rounded-lg border p-3 text-left hover:bg-gray-50 {selectedItem?.id == item.id
						? 'border-green-400 bg-green-50'
						: 'border-gray-200'}"
				>
					<div class="text-sm font-medium">{item.id}</div>
					<div class="text-xs text-gray-500">Quantity: {String(item.quantity)}</div>
					<div class="mt-1 flex flex-wrap gap-1">
						{#each itemMasterdata.get(item.id)?.effects as effect}
							<span class="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-700">
								{EffectType[effect.type]}: {effect.value}
							</span>
						{/each}
					</div>
				</button>
			{/each}
		</div>

		<div class="rounded-md border border-gray-200 p-3">
			<div class="flex items-center justify-between">
				<div class="text-sm">
					<span class="font-medium">Selected:</span>
					<span class="ml-1">{selectedItem ? selectedItem.id : 'None'}</span>
				</div>
				<div class="text-sm text-gray-600">
					Available: {selectedItem ? String(selectedItem.quantity) : '0'}
				</div>
			</div>
			<div class="mt-3 grid grid-cols-6 gap-3 items-center">
				<label for="itemAmount" class="col-span-2 text-sm text-gray-700">Amount</label>
				<input
					id="itemAmount"
					disabled={selectedItem == undefined}
					type="range"
					min={1}
					max={Number(selectedItem?.quantity)}
					bind:value={itemAmount}
					class="col-span-4"
				/>
				<div class="col-span-6 text-right text-sm">
					<span class="inline-block rounded bg-gray-100 px-2 py-0.5">
						{itemAmount}
					</span>
				</div>
			</div>
		</div>

		<div class="flex justify-end gap-2">
			<button
				class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
				onclick={() => (openDialog = false)}
			>
				Cancel
			</button>
			<button
				class="rounded-md bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
				disabled={selectedItem == undefined}
				onclick={() => dialogClicked(selectedItem!)}
			>
				Equip
			</button>
		</div>
	</div>
</Dialog>
