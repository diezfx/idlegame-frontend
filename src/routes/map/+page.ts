import type { PageLoad } from './$types';
import { MonsterClient } from '$lib/service/monsters';

export const ssr = false;

export const load: PageLoad = async ({ fetch, params }) => {
	const monsterClient = new MonsterClient();

	return {
		monsters: await monsterClient.getMonsters(),
	};
};
