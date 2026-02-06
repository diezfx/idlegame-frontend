import { clients } from '$lib/service/connect';
import { MasterdataClient } from '$lib/service/masterdata';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
	const p = await parent();
	const user = p.user;

	const userClient = clients.userClient;
	const masterdataClient = new MasterdataClient(fetch);

	return {
		progress: await userClient.getUserProgress({ id: user.userId }),
		monsters: await masterdataClient.getMonsters(),
		starterMonsters: await masterdataClient.getStarterMonsters(),
	};
};
