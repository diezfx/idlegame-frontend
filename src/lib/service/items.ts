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

export class ItemsClient {
	masterDataBaseUrl: string;
	fetch: any;

	constructor(fetch: any, masterdataBaseUrl: string) {
		this.masterDataBaseUrl = masterdataBaseUrl;
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

export function setItemsClientContext(itemsClient: ItemsClient): void {
	setContext('itemsClient', itemsClient);
}

export function getItemsClientContext(): ItemsClient {
	return getContext<ItemsClient>('itemsClient');
}
