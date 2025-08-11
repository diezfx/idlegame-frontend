import log from '$lib/log/log';
import { getContext, setContext } from 'svelte';

export interface ItemMasterDataContainer {
	items: Item[];
}

export interface Item {
	id: string;
	name: string;
	tags: string[];
	effects: ItemEffect[];
}

export interface ItemEffect {
	type: string;
	value: number;
}

export interface ItemsClientCfg {
	apiBaseUrl: string;
	masterdataBaseUrl: string;
}

export class ItemsClient {
	apiBaseUrl: string;
	masterDataBaseUrl: string;
	fetch: any;
	constructor(fetch: any, cfg: ItemsClientCfg) {
		this.apiBaseUrl = cfg.apiBaseUrl;
		this.masterDataBaseUrl = cfg.masterdataBaseUrl;
		this.fetch = fetch;
	}

	async getItemsMasterdata(): Promise<{ [key: string]: Item }> {
		const response = await this.fetch(`${this.masterDataBaseUrl}/v1.0/items`);
		const data = (await response.json()) as ItemMasterDataContainer;
		let items: { [key: string]: Item } = {};
		for (const item of data.items) {
			items[item.id] = item;
		}
		return items;
	}
}

export function setJobsClientContext(itemsClient: ItemsClient): void {
	setContext('itemsClient', itemsClient);
}

export function getJobsClientContext(): ItemsClient {
	return getContext<ItemsClient>('itemsClient');
}
