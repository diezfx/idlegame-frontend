import { createClients } from './connect';
import { type BattleJobDefinition, type ItemDefinition, type MonsterDefinition, type ProductionJobDefinition } from '../../gen/v1/masterdata_pb';

export class MasterdataClient {
    private readonly masterdataClient;

    constructor(customFetch?: typeof globalThis.fetch) {
        this.masterdataClient = createClients(customFetch).masterdataClient;
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
    async getBattleJobs(): Promise<BattleJobDefinition[]> {
        const response = await this.masterdataClient.getBattleJobs({});
        return response.jobs;
    }
    async getProductionJobs(): Promise<ProductionJobDefinition[]> {
        const response = await this.masterdataClient.getProductionJobs({});
        return response.jobs;
    }




}
