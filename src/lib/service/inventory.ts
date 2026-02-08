import { clients } from './connect';
import type { Item } from '../../gen/v1/domain_pb';

export type { Item } from '../../gen/v1/domain_pb';

export class InventoryClient {
	private readonly inventoryClient;

	constructor(customFetch?: typeof globalThis.fetch) {
		this.inventoryClient = clients.inventoryClient;
	}

	async equipItem(request: { userId: string; monsterId: string; itemId: string; quantity: bigint }): Promise<void> {
		await this.inventoryClient.equipItem(request);
	}

	async unEquipItem(request: { userId: string; monsterId: string; itemId: string }): Promise<void> {
		await this.inventoryClient.unEquipItem(request);
	}

	async getEquipment(monsterId: string): Promise<Item[]> {
		const response = await this.inventoryClient.getEquipment({ monsterId });
		return response.items;
	}
}
