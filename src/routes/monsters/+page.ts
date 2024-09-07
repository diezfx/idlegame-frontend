import { loadConfig } from '$lib/config/config';
import { MonsterClient } from '$lib/service/monsters';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const cfg = loadConfig();
	const monsterClient = new MonsterClient(fetch, cfg.monsterClientCfg);
	return {
		monsters: await monsterClient.getMonsters(),
	};
};