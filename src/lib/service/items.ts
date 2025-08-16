import { getContext, setContext } from 'svelte';
import { ContainerSchema, type ItemDefinition } from '../../gen/v1/masterdata_pb';

export class ItemsClient {
	masterDataBaseUrl: string;
	fetch: any;

	constructor(fetch: any, masterdataBaseUrl: string) {
		this.masterDataBaseUrl = masterdataBaseUrl;
		this.fetch = fetch;
	}

	async getItemsMasterdata(): Promise<{ [key: string]: ItemDefinition }> {
		const response = await this.fetch(`${this.masterDataBaseUrl}/v1.0/items`);
		const data = await response.json();
		const items: { [key: string]: ItemDefinition } = {};
		for (const item of data) {
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
