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

import log from '$lib/log/log';
import { getContext, setContext } from 'svelte';
import type { Item } from './inventory';
import type { Monster } from './monsters';

/*
type ItemWithQuantity struct {
	ID       string `json:"id"`
	Quantity int    `json:"quantity"`
}
*/

export interface ItemWithQuantity {
	id: string;
	quantity: number;
}

export interface JobMasterdata {
	id: string;
	name: string;
	jobType: string;
	levelRequirement: number;
	duration: string;
	staminaCost: number;
	rewards: {
		items: Item[];
		experience: number;
	};
	affinity: {
		elements: Record<string, number>;
	};
	ingredients: ItemWithQuantity[];
}

export interface JobState {
	status: string
	updatedAt: string;
}

export interface Reward {
	id: string;
	quantity: number;
}

export interface Job {
	id: number;
	jobDefId: string;
	userId: number;
	createdAt: string;
	monsterIds: number[];
	jobType: string;
	rewards: Reward[];
	ingredients: ItemWithQuantity[];
	jobState: JobState;

}

export type BattleMonster = Monster & {
	lastAttacked: string;
};
export interface BattleJob {
	playerMonsters: BattleMonster[]
	enemyMonsters: BattleMonster[]
}

export interface StartGatheringJob {
	userId: number;
	monster: number;
	jobDefId: string;
}

export interface StartProcessingJob {
	userId: number;
	monster: number;
	jobDefId: string;
}

export interface StartBattleJob {
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

	async getBattleJob(jobId: number): Promise<Job & BattleJob | undefined> {
		const response = await this.fetch(`${this.apiBaseUrl}/v1.0/battles/${jobId}`);
		if (!response.ok) {
			return undefined;
		}
		const data = (await response.json()) as Job & BattleJob;
		return data;
	}

	async startJob(request: StartGatheringJob): Promise<number> {
		const response = await this.fetch(`${this.apiBaseUrl}/v1.0/jobs/gathering/`, {
			method: 'POST',
			body: JSON.stringify(request),
		});
		const data = await response.json();
		return data;
	}

	async startProcessingJob(request: StartProcessingJob): Promise<number> {
		const response = await this.fetch(`${this.apiBaseUrl}/v1.0/jobs/processing/`, {
			method: 'POST',
			body: JSON.stringify(request),
		});
		const data = await response.json();
		return data;
	}

	async startProductJob(request: StartProcessingJob): Promise<number> {
		const response = await this.fetch(`${this.apiBaseUrl}/v1.0/jobs/products/`, {
			method: 'POST',
			body: JSON.stringify(request),
		});
		const data = await response.json();
		return data;
	}

	async startBattleJob(request: StartBattleJob): Promise<number> {
		const response = await this.fetch(`${this.apiBaseUrl}/v1.0/battles`, {
			method: 'POST',
			body: JSON.stringify(request),
		});
		const data = await response.json();
		return data;
	}

	async stopJob(jobId: number): Promise<void> {
		const _ = await this.fetch(`${this.apiBaseUrl}/v1.0/jobs/${jobId}`, {
			method: 'DELETE',
		});
	}

	async getJobMasterdata(): Promise<JobMasterdata[]> {
		const response = await this.fetch(`${this.masterDataBaseUrl}/v1.0/jobs/gathering`);
		return await response.json();
	}

	async getProcessingJobMasterdata(): Promise<JobMasterdata[]> {
		const response = await this.fetch(`${this.masterDataBaseUrl}/v1.0/jobs/processing`);
		return await response.json();
	}
	async getProductJobMasterdata(): Promise<JobMasterdata[]> {
		const response = await this.fetch(`${this.masterDataBaseUrl}/v1.0/jobs/product`);
		return await response.json();
	}

	async getBattleJobMasterdata(): Promise<JobMasterdata[]> {
		const response = await this.fetch(`${this.masterDataBaseUrl}/v1.0/jobs/battle`);
		return await response.json();
	}
}

export function setJobsClientContext(jobClient: JobsClient): void {
	setContext('jobsClient', jobClient);
}

export function getJobsClientContext(): JobsClient {
	return getContext<JobsClient>('jobsClient');
}
