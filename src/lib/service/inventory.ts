export interface Inventory {
	userId: number;
	items: Item[];
}
export interface Item {
	quantity: number;
	id: string;
}

export interface InventoryClientCfg {
	baseUrl: string;
}

export interface Params {
	tags?: Tags[];
}

type Tags = 'consumable';

export class InventoryClient {
	baseUrl: string;
	fetch: any;
	constructor(fetch: any, cfg: InventoryClientCfg) {
		this.baseUrl = cfg.baseUrl;
		this.fetch = fetch;
	}

	async getInventory(userId: number, params?: Params): Promise<Inventory> {
		let queryParams = new URLSearchParams();
		if (params) {
			if (params.tags) {
				params.tags.forEach((tag) => {
					queryParams.append('tags', tag);
				});
			}
		}
		const response = await this.fetch(`${this.baseUrl}/v1.0/inventory/${userId}?${queryParams.toString()}`);
		const data = (await response.json()) as Inventory;
		return data;
	}
}
