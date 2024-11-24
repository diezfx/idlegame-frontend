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

export class InventoryClient {
	baseUrl: string;
	fetch: any;
	constructor(fetch: any, cfg: InventoryClientCfg) {
		this.baseUrl = cfg.baseUrl;
		this.fetch = fetch;
	}

	async getInventory(userId: number): Promise<Inventory> {
		const response = await this.fetch(`${this.baseUrl}/v1.0/inventory/${userId}`);
		const data = (await response.json()) as Inventory;
		return data;
	}
}
