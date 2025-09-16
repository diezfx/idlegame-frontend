<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import MonsterView from '$lib/widgets/monster.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import log from '$lib/log/log';
	import { getUserFromContext } from '$lib/stores/user';
	import { invalidateAll } from '$app/navigation';
	import type { Item, Monster } from '../../gen/v1/domain_pb.js';
	import { InventoryClient } from '$lib/service/inventory.js';

	let { data } = $props();

	const user = getUserFromContext()!;
	const inventoryClient = new InventoryClient(fetch);

	let openDialog = $state(false);
	let selectedMonster: Monster | undefined = $state(undefined);
	let selectedItem: Item | undefined = $state(undefined);
	let itemAmount = $state(1);

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
		inventoryClient.equipItem({
			userId: BigInt(user.userId),
			monsterId: BigInt(selectedMonster.entity!.id),
			itemId: item.id,
			quantity: BigInt(itemAmount),
		});
		reset();
		invalidateAll();
	}

	async function itemDeleteAction(monsterId: bigint, itemId: string): Promise<void> {
		await inventoryClient.unEquipItem({
			userId: BigInt(user.userId),
			monsterId: BigInt(monsterId),
			itemId: itemId,
		});
		invalidateAll();
		log.info('itemDeleteAction', { itemId });
	}
</script>

<h1>Monsters</h1>
<div class="grid grid-cols-3 gap-4">
	{#each data.monsters as monster}
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

<Dialog.Root open={openDialog} onOpenChange={() => (openDialog = false)}>
	<Dialog.Trigger>Open</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Chose Item to Equip</Dialog.Title>
		</Dialog.Header>
		<div class="grid grid-cols-1">
			{#each data.inventory.items as item}
				<button
					onclick={() => (selectedItem = item)}
					class="grid grid-cols-4 m-1 grow hover:bg-green-100 {selectedItem?.id == item.id ? 'bg-green-200' : ''}"
				>
					<p>{item.id}</p>
					<p>{item.quantity}</p>
					{#each data.itemMasterdata[item.id]?.effects as effect}
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
	</Dialog.Content>
</Dialog.Root>
