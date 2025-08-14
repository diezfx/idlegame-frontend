import { inventoryClient } from './connect';
import type { Inventory } from '../../gen/v1/domain_pb';

export class InventoryClient {
	async getInventory(userId: bigint): Promise<Inventory> {
		return await inventoryClient.getInventory({ userId });
	}
}
