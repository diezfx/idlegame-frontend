import type { Client } from '@connectrpc/connect';
import { JobService as JobServiceDefinition } from '$gen/v1/service_pb';
import type { GameStateStore } from '$lib/stores/gamestate.svelte';
import type { UserStore } from '$lib/stores/user.svelte';

export type StartBattleRequest = {
	monsterId: string;
	jobDefinitionId: string;
};

export class BattleService {
	constructor(
		private readonly client: Client<typeof JobServiceDefinition>,
		private readonly gameState: GameStateStore,
		private readonly userState: UserStore,
	) {}

	async startBattle(request: StartBattleRequest): Promise<string> {
		await this.gameState.initialize();
		const response = await this.client.startBattle({
			...request,
			userId: this.userState.getUser().userId,
		});
		return response.jobId;
	}
}
