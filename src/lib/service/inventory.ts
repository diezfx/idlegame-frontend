import { createClients } from './connect';
import type { Item } from '../../gen/v1/domain_pb';

export type { Item } from '../../gen/v1/domain_pb';

export class InventoryClient {
	private readonly inventoryClient;

	constructor(customFetch?: typeof globalThis.fetch) {
		this.inventoryClient = createClients(customFetch).inventoryClient;
	}

	async getInventory(userId: bigint): Promise<Item[]> {
		const inv = await this.inventoryClient.getInventory({ userId });
		return inv.totalItems;
	}
	async equipItem(request: { userId: bigint; monsterId: bigint; itemId: string; quantity: bigint }): Promise<void> {
		await this.inventoryClient.equipItem(request);
	}

	async unEquipItem(request: { userId: bigint; monsterId: bigint; itemId: string }): Promise<void> {
		await this.inventoryClient.unEquipItem(request);
	}

	async getEquipment(monsterId: bigint): Promise<Item[]> {
		const response = await this.inventoryClient.getEquipment({ monsterId });
		return response.items;
	}
}
