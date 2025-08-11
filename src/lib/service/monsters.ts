/*
[
    {
        "id": 1,
        "name": "schiggo",
        "type": "Water",
        "level": 1,
        "experience": 0
    },
    {
        "id": 2,
        "name": "schiggo",
        "type": "Water",
        "level": 1,
        "experience": 0
    },
    {
        "id": 3,
        "name": "schiggo",
        "type": "Water",
        "level": 1,
        "experience": 0
    }
]
*/

export interface EquippedItem {
	itemId: string;
	quantity: number;
}

export interface Monster {
	id: number;
	jobId: number | undefined;
	name: string;
	type: string;
	level: number;
	experience: number;
	health: number;
	maxHealth: number;
	attack_power: number;
	stamina: number;
	maxStamina: number;
	equippedItems: EquippedItem[];
	position: Position;
}

export interface Position {
	x: number;
	y: number;
}

export interface EquipItem {
	userId: number;
	monster: number;
	itemId: string;
	quantity: number;
}
export interface UnEquipItem {
	userId: number;
	monster: number;
	itemId: string;
}

export interface MonsterClientCfg {
	baseUrl: string;
}

export class MonsterClient {
	baseUrl: string;
	fetch: any;
	constructor(fetch: any, cfg: MonsterClientCfg) {
		this.baseUrl = cfg.baseUrl;
		this.fetch = fetch;
	}

	async getMonsters(): Promise<Monster[]> {
		const response = await this.fetch(`${this.baseUrl}/v1.0/monsters`);
		const data = (await response.json()) as Monster[];
		return data;
	}

	async equipItem(equipItemCommand: EquipItem): Promise<void> {
		const _ = await this.fetch(`${this.baseUrl}/v1.0/equipment`, {
			method: 'POST',
			body: JSON.stringify(equipItemCommand),
		});
	}

	async unEquipItem(equipItemCommand: UnEquipItem): Promise<void> {
		const _ = await this.fetch(`${this.baseUrl}/v1.0/equipment`, {
			method: 'DELETE',
			body: JSON.stringify(equipItemCommand),
		});
	}
}
