import type { Client } from '@connectrpc/connect';
import { JobService as JobServiceDefinition } from '$gen/v1/service_pb';
import type { GameStateStore } from '$lib/stores/gamestate.svelte';

export type StartJobRequest = {
	monsterId: string;
	jobDefinitionId: string;
};

export class JobService {
	constructor(
		private readonly client: Client<typeof JobServiceDefinition>,
		private readonly gameState: GameStateStore,
		private readonly getUserId: () => string,
	) {}

	async startJob(request: StartJobRequest): Promise<string> {
		await this.gameState.initialize();
		const response = await this.client.startProductionJob({
			...request,
			userId: this.getUserId(),
		});
		return response.jobId;
	}

	async stopJob(id: string): Promise<void> {
		await this.gameState.initialize();
		await this.client.deleteJob({ id });
	}
}
