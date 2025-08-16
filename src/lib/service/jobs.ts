import { jobClient } from './connect';
import type { Job } from '../../gen/v1/domain_pb';
import { getContext, setContext } from 'svelte';
export type { Job } from '../../gen/v1/domain_pb';

export interface BattleMonster {
	name: string;
	health: number;
	maxHealth: number;
	lastAttacked: string;
}

export interface BattleJob extends Job {
	playerMonsters: BattleMonster[];
	enemyMonsters: BattleMonster[];
}

export interface Item {
	quantity: number;
	id: string;
}

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

export class JobsClient {
	constructor(
		private fetch: any,
		private masterDataBaseUrl: string,
	) {}
	async getJobs(): Promise<Job[]> {
		const response = await jobClient.listJobs({});
		return response.jobs;
	}

	async getBattleJob(jobId: bigint): Promise<Job | undefined> {
		return await jobClient.getJob({ id: jobId });
	}

	async startJob(request: { userId: bigint; monsterId: bigint; jobDefinitionId: string }): Promise<bigint> {
		const response = await jobClient.startProductionJob(request);
		return response.jobId;
	}

	async startProcessingJob(request: { userId: bigint; monsterId: bigint; jobDefinitionId: string }): Promise<bigint> {
		const response = await jobClient.startProductionJob(request);
		return response.jobId;
	}

	async startProductJob(request: { userId: bigint; monsterId: bigint; jobDefinitionId: string }): Promise<bigint> {
		const response = await jobClient.startProductionJob(request);
		return response.jobId;
	}

	async startBattleJob(request: { userId: bigint; monsterId: bigint; jobDefinitionId: string }): Promise<bigint> {
		const response = await jobClient.startBattle(request);
		return response.jobId;
	}

	async stopJob(jobId: bigint): Promise<void> {
		await jobClient.deleteJob({ id: jobId });
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
