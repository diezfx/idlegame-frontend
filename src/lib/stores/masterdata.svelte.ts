import type { CityDefinition, ItemDefinition, MonsterDefinition } from '../../gen/v1/masterdata_pb';
import { clients } from '$lib/service/connect';
import type { BattleJobInfo, ProductionJobInfo } from '../../gen/v1/service_pb';
import { SvelteMap } from 'svelte/reactivity';

class MasterdataStore {
	Monsters: MonsterDefinition[];
	ProductionJobs: ProductionJobInfo[];
	BattleJobs: BattleJobInfo[];
	Items: SvelteMap<string, ItemDefinition>;
	Cities: CityDefinition[];
	constructor() {
		this.Monsters = [];
		this.ProductionJobs = [];
		this.BattleJobs = [];
		this.Cities = [];
		this.Items = new SvelteMap<string, ItemDefinition>();
	}

	async getMonsters(): Promise<MonsterDefinition[]> {
		//only fetch once
		if (this.Monsters.length > 0) {
			return this.Monsters;
		}
		const monsters = await clients.masterdataClient.getMonsters({});
		this.Monsters = monsters.monsters;

		return this.Monsters;
	}

	async getProductionJobs(): Promise<ProductionJobInfo[]> {
		if (this.ProductionJobs.length > 0) {
			return this.ProductionJobs;
		}
		const jobs = await clients.masterdataClient.getProductionJobs({ cityId: 'city_1' });
		this.ProductionJobs = jobs.jobs;
		return this.ProductionJobs;
	}
	async getBattleJobs(): Promise<BattleJobInfo[]> {
		if (this.BattleJobs.length > 0) {
			return this.BattleJobs;
		}
		const jobs = await clients.masterdataClient.getBattleJobs({ cityId: 'city_1' });
		this.BattleJobs = jobs.jobs;
		return this.BattleJobs;
	}
	async getCities(): Promise<CityDefinition[]> {
		//only fetch once
		if (this.Cities.length > 0) {
			return this.Cities;
		}
		const cities = await clients.masterdataClient.getCities({});
		this.Cities = cities.cities;
		return this.Cities;
	}

	async getItems(): Promise<SvelteMap<string, ItemDefinition>> {
		//only fetch once
		if (this.Items.size > 0) {
			return this.Items;
		}
		const items = await clients.masterdataClient.getItems({});
		for (const item of items.items) {
			this.Items.set(item.id, item);
		}
		return this.Items;
	}
}

export const masterdataStore = new MasterdataStore();
