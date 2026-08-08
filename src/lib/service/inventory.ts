import type { Client } from '@connectrpc/connect';
import { InventoryService as InventoryServiceDefinition } from '$gen/v1/service_pb';
import type { GameStateStore } from '$lib/stores/gamestate.svelte';
import type { UserStore } from '$lib/stores/user.svelte';

export type EquipItemRequest = {
	monsterId: string;
	itemId: string;
	quantity: number;
};

export type UnequipItemRequest = {
	monsterId: string;
	itemId: string;
};

export class InventoryService {
	constructor(
		private readonly client: Client<typeof InventoryServiceDefinition>,
		private readonly gameState: GameStateStore,
		private readonly userState: UserStore,
	) {}

	async equipItem(request: EquipItemRequest): Promise<void> {
		await this.gameState.initialize();
		await this.client.equipItem({
			...request,
			userId: this.userState.getUser().userId,
			quantity: BigInt(request.quantity),
		});
	}

	async unequipItem(request: UnequipItemRequest): Promise<void> {
		await this.gameState.initialize();
		await this.client.unEquipItem({
			...request,
			userId: this.userState.getUser().userId,
		});
	}
}
