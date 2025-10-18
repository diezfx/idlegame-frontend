import { clients } from './connect';
import type { ItemDefinition, MonsterDefinition } from '../../gen/v1/masterdata_pb';
import type { BattleJobInfo, ProductionJobInfo } from '../../gen/v1/service_pb';

export class MasterdataClient {
	private readonly masterdataClient;

	constructor(customFetch?: typeof globalThis.fetch) {
		this.masterdataClient = clients.masterdataClient;
	}

	async getItems(): Promise<{ [key: string]: ItemDefinition }> {
		const response = await this.masterdataClient.getItems({});
		const data = response.items;
		const items: { [key: string]: ItemDefinition } = {};
		for (const item of data) {
			items[item.id] = item;
		}
		return items;
	}
	async getMonsters(): Promise<MonsterDefinition[]> {
		const response = await this.masterdataClient.getMonsters({});
		return response.monsters;
	}
	async getStarterMonsters(): Promise<number[]> {
		const response = await this.masterdataClient.getStarterMonsters({});
		return response.monsters;
	}
	async getBattleJobs(): Promise<BattleJobInfo[]> {
		const response = await this.masterdataClient.getBattleJobs({});
		return response.jobs;
	}
	async getProductionJobs(): Promise<ProductionJobInfo[]> {
		const response = await this.masterdataClient.getProductionJobs({});
		return response.jobs;
	}
}
