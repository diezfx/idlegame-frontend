import { clients } from '$lib/service/connect';
import { gameStateStore } from '$lib/stores/gamestate.svelte';
import { userStore } from '$lib/stores/user.svelte';

export async function startBattle({
	monsterId,
	jobDefinitionId,
}: {
	monsterId: string;
	jobDefinitionId: string;
}): Promise<string> {
	await gameStateStore.initialize();
	const response = await clients.jobClient.startBattle({
		userId: userStore.getUser().userId,
		monsterId,
		jobDefinitionId,
	});
	return response.jobId;
}
