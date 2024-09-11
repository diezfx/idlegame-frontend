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

export interface Monster {
    id: number;
    jobId: number | undefined;
    name: string;
    type: string;
    level: number;
    experience: number;
    stamina: number,
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
}
