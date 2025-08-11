import { loadConfig } from '$lib/config/config';
import { InventoryClient } from '$lib/service/inventory';
import { ItemsClient } from '$lib/service/items';
import { MonsterClient } from '$lib/service/monsters';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) => {
	const cfg = loadConfig();
	const p = await parent();
	const user = p.user;
	const monsterClient = new MonsterClient(fetch, cfg.monsterClientCfg);
	const inventoryClient = new InventoryClient(fetch, cfg.inventoryClientCfg);
	const itemCliemt = new ItemsClient(fetch, cfg.itemClientCfg);
	return {
		monsters: await monsterClient.getMonsters(),
		inventory: await inventoryClient.getInventory(user.userId, {
			tags: ['consumable'],
		}),
		itemMasterdata: await itemCliemt.getItemsMasterdata(),
	};
};
