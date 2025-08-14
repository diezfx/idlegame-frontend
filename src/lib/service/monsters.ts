import { monsterClient, inventoryClient } from './connect';
import type { Monster, Item } from '../../gen/v1/domain_pb';

export class MonsterClient {
	async getMonsters(): Promise<Monster[]> {
		const response = await monsterClient.listMonsters({});
		return response.monsters;
	}

	async equipItem(request: { userId: bigint; monsterId: bigint; itemId: string; quantity: bigint }): Promise<void> {
		await inventoryClient.equipItem(request);
	}

	async unEquipItem(request: { userId: bigint; monsterId: bigint; itemId: string }): Promise<void> {
		await inventoryClient.unEquipItem(request);
	}

	async getEquipment(monsterId: bigint): Promise<Item[]> {
		const response = await inventoryClient.getEquipment({ monsterId });
		return response.items;
	}
}
