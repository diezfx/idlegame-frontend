import type { PageLoad } from './$types';
import { MonsterClient } from '$lib/service/monsters';
import { createClients } from '$lib/service/connect';

export const ssr = false;

export const load: PageLoad = async ({ fetch, params, parent }) => {
	const masterdataClient = createClients(fetch).masterdataClient;
	const monsterClient = new MonsterClient(fetch);
	const p = await parent();
	const user = p.user;


	return {
		cities: (await masterdataClient.getCities({})).cities,
		monsters: await monsterClient.getMonsters(user.userId),
	};
};
