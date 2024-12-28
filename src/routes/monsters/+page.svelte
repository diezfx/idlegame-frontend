<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { MonsterClient, type Monster } from '$lib/service/monsters';
	import MonsterView from '$lib/widgets/monster.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import log from '$lib/log/log';
	import type { Item } from '$lib/service/inventory';
	import { getUserFromContext } from '$lib/stores/user';
	import { getConfigContext } from '$lib/config/config';
	import { invalidate, invalidateAll } from '$app/navigation';

	let { data } = $props();

	const cfg = getConfigContext();
	const user = getUserFromContext()!;
	const monsterClient = new MonsterClient(fetch, cfg.monsterClientCfg);

	let openDialog = $state(false);
	let selectedMonster: Monster | undefined = $state(undefined);

	// make a call to api to equip item
	function dialogClicked(item: Item): void {
		openDialog = false;
		console.log('dialogClicked', item);
		if (selectedMonster == undefined) {
			log.error('No monster selected');
			return;
		}
		monsterClient.equipItem({
			userId: user.userId,
			monster: selectedMonster.id!!,
			itemId: item.id,
			quantity: item.quantity,
		});
		invalidateAll();
	}

	async function itemDeleteAction(monsterId: number, itemId: string): void {
		await monsterClient.unEquipItem({
			userId: user.userId,
			monster: monsterId,
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
			<MonsterView {monster} itemDeleteAction={(itemID) => itemDeleteAction(monster.id, itemID)}
			></MonsterView>
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
		<div>Inventory</div>
		<div class="grid grid-cols-1">
			{#each data.inventory.items as item}
				<button
					onclick={() => dialogClicked(item)}
					class="grid grid-cols-4 m-1 flex-grow hover:bg-green-200"
				>
					<p>{item.id}</p>
					<p>{item.quantity}</p>
					{#each data.itemMasterdata[item.id].effects as effect}
						<p>{effect.type}</p>
						<p>{effect.value}</p>
					{/each}
				</button>
			{/each}
		</div>
	</Dialog.Content>
</Dialog.Root>
