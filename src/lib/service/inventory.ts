import { clients } from '$lib/service/connect';
import { gameStateStore } from '$lib/stores/gamestate.svelte';
import { userStore } from '$lib/stores/user.svelte';

export async function equipItem({
	monsterId,
	itemId,
	quantity,
}: {
	monsterId: string;
	itemId: string;
	quantity: number;
}): Promise<void> {
	await gameStateStore.initialize();
	await clients.inventoryClient.equipItem({
		userId: userStore.getUser().userId,
		monsterId,
		itemId,
		quantity: BigInt(quantity),
	});
}

export async function unequipItem({ monsterId, itemId }: { monsterId: string; itemId: string }): Promise<void> {
	await gameStateStore.initialize();
	await clients.inventoryClient.unEquipItem({
		userId: userStore.getUser().userId,
		monsterId,
		itemId,
	});
}
