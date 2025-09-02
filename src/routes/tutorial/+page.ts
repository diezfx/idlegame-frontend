import { createClients } from '$lib/service/connect';
import { MasterdataClient } from '$lib/service/masterdata';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
	const p = await parent();
	const user = p.user;

	const userClient = createClients(fetch).userClient;
	const masterdataClient = new MasterdataClient(fetch);

	return {
		progress: await userClient.getUserProgress({ id: BigInt(user.userId) }),
		monsters: await masterdataClient.getMonsters(),
		starterMonsters: await masterdataClient.getStarterMonsters(),
	};
};
