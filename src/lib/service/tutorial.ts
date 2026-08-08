import type { Client } from '@connectrpc/connect';
import { TutorialService as TutorialServiceDefinition } from '$gen/v1/service_pb';
import type { GameStateStore } from '$lib/stores/gamestate.svelte';
import type { UserStore } from '$lib/stores/user.svelte';

export class TutorialService {
	constructor(
		private readonly client: Client<typeof TutorialServiceDefinition>,
		private readonly gameState: GameStateStore,
		private readonly userState: UserStore,
	) {}

	async chooseStarter(monsterDefinitionId: number): Promise<void> {
		await this.gameState.initialize();
		await this.client.chooseStarter({
			id: this.userState.getUser().userId,
			monDefinitionId: BigInt(monsterDefinitionId),
		});
	}
}
