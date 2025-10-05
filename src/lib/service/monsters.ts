import { createClients } from './connect';
import type { Monster } from '../../gen/v1/domain_pb';


export class MonsterClient {
	private readonly monsterClient;

	constructor(customFetch?: typeof globalThis.fetch) {
		const { monsterClient } = createClients(customFetch);
		this.monsterClient = monsterClient;
	}

	async getMonsters(userId: number): Promise<Monster[]> {
		const response = await this.monsterClient.listMonsters({ ownerId: BigInt(userId) });
		return response.monsters;
	}
}
