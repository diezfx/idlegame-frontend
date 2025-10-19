<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import MonsterView from '$lib/widgets/monster.svelte';
	import log from '$lib/log/log';
	import type { Item, Monster } from '../../gen/v1/domain_pb.js';
	import Dialog from '$lib/components/ui/dialog/dialog.svelte';
	import { gameStateStore } from '$lib/stores/gamestate.svelte.js';
	import { masterdataStore } from '$lib/stores/masterdata.svelte.js';

	let openDialog = $state(false);
	let selectedMonster: Monster | undefined = $state(undefined);
	let selectedItem: Item | undefined = $state(undefined);
	let itemAmount = $state(1);
	let monsters = await gameStateStore.getMonsters();

	let itemMasterdata = await masterdataStore.getItems();

	let inventory = (await gameStateStore.getInventories()).values().next().value!;

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
			monsterId: BigInt(selectedMonster.entity!.id),
			itemId: item.id,
			quantity: itemAmount,
		});
		reset();
	}

	async function itemDeleteAction(monsterId: bigint, itemId: string): Promise<void> {
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
		<div>
			<MonsterView {monster} itemDeleteAction={(itemID) => itemDeleteAction(monster.entity!.id, itemID)}></MonsterView>
			<Card
				onclick={() => {
					selectedMonster = monster;
					openDialog = true;
				}}
				class="button text-center text-green-500 text-2xl"
				>+
			</Card>
		</div>
	{/each}
</div>

<Dialog open={openDialog} onClose={() => (openDialog = false)}>
	<h2>Choose Item to Equip</h2>
	<div class="grid grid-cols-1">
		{#each inventory.items as item}
			<button
				onclick={() => (selectedItem = item)}
				class="grid grid-cols-4 m-1 grow hover:bg-green-100 {selectedItem?.id == item.id ? 'bg-green-200' : ''}"
			>
				<p>{item.id}</p>
				<p>{item.quantity}</p>
				{#each itemMasterdata.get(item.id)?.effects as effect}
					<p>{effect.type}</p>
					<p>{effect.value}</p>
				{/each}
			</button>
		{/each}
	</div>
	<label for="itemAmount">Amount {itemAmount}</label>
	<input
		id="itemAmount"
		disabled={selectedItem == undefined}
		type="range"
		min={1}
		max={Number(selectedItem?.quantity)}
		bind:value={itemAmount}
	/>
	<button disabled={selectedItem == undefined} onclick={() => dialogClicked(selectedItem!)}>Equip</button>
</Dialog>
