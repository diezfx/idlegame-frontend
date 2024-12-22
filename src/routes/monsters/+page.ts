import { loadConfig } from '$lib/config/config';
import { InventoryClient } from '$lib/service/inventory';
import { MonsterClient } from '$lib/service/monsters';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) => {
	const cfg = loadConfig();
	const p = await parent();
	const user = p.user;
	const monsterClient = new MonsterClient(fetch, cfg.monsterClientCfg);
	const inventoryClient = new InventoryClient(fetch, cfg.inventoryClientCfg);
	return {
		monsters: await monsterClient.getMonsters(),
		inventory: await inventoryClient.getInventory(user.userId),
	};
};
