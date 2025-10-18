import { clients } from './connect';
import type { Job, JobMonster } from '../../gen/v1/domain_pb';
import { getContext, setContext } from 'svelte';
import { type BattleJobDefinition, type ProductionJobDefinition } from '../../gen/v1/masterdata_pb';

export type { Job } from '../../gen/v1/domain_pb';
export type { BattleJobDefinition, ProductionJobDefinition } from '../../gen/v1/masterdata_pb';

export type JobMasterdata = ProductionJobDefinition | BattleJobDefinition;
export type BattleMonster = JobMonster;

export interface Item {
	quantity: number;
	id: string;
}

export interface ItemWithQuantity {
	id: string;
	quantity: number;
}

export class JobsClient {
	private readonly jobClient;

	constructor(svFetch?: typeof globalThis.fetch) {
		const { jobClient, masterdataClient } = clients;
		this.jobClient = jobClient;
	}

	async getJobs(): Promise<Job[]> {
		const response = await this.jobClient.listJobs({});
		return response.jobs;
	}

	async getBattleJob(jobId: bigint): Promise<Job | undefined> {
		return await this.jobClient.getJob({ id: jobId });
	}

	async startJob(request: { userId: bigint; monsterId: bigint; jobDefinitionId: string }): Promise<bigint> {
		const response = await this.jobClient.startProductionJob(request);
		return response.jobId;
	}

	async startProcessingJob(request: { userId: bigint; monsterId: bigint; jobDefinitionId: string }): Promise<bigint> {
		const response = await this.jobClient.startProductionJob(request);
		return response.jobId;
	}

	async startProductJob(request: { userId: bigint; monsterId: bigint; jobDefinitionId: string }): Promise<bigint> {
		const response = await this.jobClient.startProductionJob(request);
		return response.jobId;
	}

	async startBattleJob(request: { userId: bigint; monsterId: bigint; jobDefinitionId: string }): Promise<bigint> {
		const response = await this.jobClient.startBattle(request);
		return response.jobId;
	}

	async stopJob(jobId: bigint): Promise<void> {
		await this.jobClient.deleteJob({ id: jobId });
	}
}

export function setJobsClientContext(jobClient: JobsClient): void {
	setContext('jobsClient', jobClient);
}

export function getJobsClientContext(): JobsClient {
	return getContext<JobsClient>('jobsClient');
}
