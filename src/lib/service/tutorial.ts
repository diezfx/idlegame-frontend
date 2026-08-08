import { clients } from '$lib/service/connect';
import { gameStateStore } from '$lib/stores/gamestate.svelte';
import { userStore } from '$lib/stores/user.svelte';

export async function chooseStarter(monsterDefinitionId: number): Promise<void> {
	await gameStateStore.initialize();
	await clients.tutorialClient.chooseStarter({
		id: userStore.getUser().userId,
		monDefinitionId: BigInt(monsterDefinitionId),
	});
}
