import type { Client } from '@connectrpc/connect';
import { JobService as JobServiceDefinition } from '$gen/v1/service_pb';
import type { GameStateStore } from '$lib/stores/gamestate.svelte';
import type { UserStore } from '$lib/stores/user.svelte';

export type StartJobRequest = {
	monsterId: string;
	jobDefinitionId: string;
};

export class JobService {
	constructor(
		private readonly client: Client<typeof JobServiceDefinition>,
		private readonly gameState: GameStateStore,
		private readonly userState: UserStore,
	) {}

	async startJob(request: StartJobRequest): Promise<string> {
		await this.gameState.initialize();
		const response = await this.client.startProductionJob({
			...request,
			userId: this.userState.getUser().userId,
		});
		return response.jobId;
	}

	async stopJob(id: string): Promise<void> {
		await this.gameState.initialize();
		await this.client.deleteJob({ id });
	}
}
