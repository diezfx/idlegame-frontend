/*
    "id": "spruce",
    "jobType": "woodcutting",
    "levelRequirement": 1,
    "duration": "3s",
    "rewards": {
        "items": [
            {
                "id": "spruce",
                "quantity": 1
            }
        ],
        "experience": 1
    },
    "affinity": {
        "elements": {
        
                "Air": 1,
                "Earth": 3,
                "Fire": 0.5,
                "Water": 1
            }
    }
*/

import type { Item } from './inventory';

export interface JobMasterdata {
	id: string;
	jobType: string;
	levelRequirement: number;
	duration: string;
	rewards: {
		items: Item[];
		experience: number;
	};
	affinity: {
		elements: Record<string, number>;
	};
}

export interface Job {
	id: number;
	jobDefId: string;
	userId: number;
	startedAt: string;
	updatedAt: string;
	monsterIds: number[];
	jobType: string;
}

export interface StartGatheringJob {
	userId: number;
	monster: number;
	jobDefId: string;
}

export interface JobsClientCfg {
	apiBaseUrl: string;
	masterdataBaseUrl: string;
}

export class JobsClient {
	apiBaseUrl: string;
	masterDataBaseUrl: string;
	fetch: any;
	constructor(fetch: any, cfg: JobsClientCfg) {
		this.apiBaseUrl = cfg.apiBaseUrl;
		this.masterDataBaseUrl = cfg.masterdataBaseUrl;
		this.fetch = fetch;
	}

	async getJobs(): Promise<Job[]> {
		const response = await this.fetch(`${this.apiBaseUrl}/v1.0/jobs`);
		const data = (await response.json()) as Job[];
		return data;
	}

	async startJob(request: StartGatheringJob): Promise<number> {
		const response = await this.fetch(`${this.apiBaseUrl}/v1.0/jobs/gathering`, {
			method: 'POST',
			body: JSON.stringify(request),
		});
		const data = await response.json();
		return data;
	}

	async getJobMasterdata(): Promise<JobMasterdata[]> {
		const response = await this.fetch(`${this.masterDataBaseUrl}/jobs/gathering`);
		return await response.json();
	}
}
