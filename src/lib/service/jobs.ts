import { jobClient, masterdataClient } from './connect';
import type { Job } from '../../gen/v1/domain_pb';
import { getContext, setContext } from 'svelte';
import {
	BattleJobDefinitionSchema,
	ContainerSchema,
	ProductionJobDefinitionSchema,
	type BattleJobDefinition,
	type ProductionJobDefinition,
} from '../../gen/v1/masterdata_pb';

export interface Item {
	quantity: number;
	id: string;
}

export interface ItemWithQuantity {
	id: string;
	quantity: number;
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

	async getJobMasterdata(): Promise<ProductionJobDefinition[]> {
		const jobs = await masterdataClient.getProductionJobs({});
		return jobs.jobs;
	}

	async getProcessingJobMasterdata(): Promise<ProductionJobDefinition[]> {
		const jobs = await masterdataClient.getProductionJobs({});
		return jobs.jobs;
	}
	async getProductJobMasterdata(): Promise<ProductionJobDefinition[]> {
		const jobs = await masterdataClient.getProductionJobs({});
		return jobs.jobs;
	}

	async getBattleJobMasterdata(): Promise<BattleJobDefinition[]> {
		const jobs = await masterdataClient.getBattleJobs({});
		return jobs.jobs;
	}
}

export function setJobsClientContext(jobClient: JobsClient): void {
	setContext('jobsClient', jobClient);
}

export function getJobsClientContext(): JobsClient {
	return getContext<JobsClient>('jobsClient');
}
