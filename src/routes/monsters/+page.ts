import { config } from '$lib/config/config';
import { InventoryClient } from '$lib/service/inventory';
import { ItemsClient } from '$lib/service/items';
import { MonsterClient } from '$lib/service/monsters';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) => {
	const p = await parent();
	const user = p.user;
	const monsterClient = new MonsterClient();
	const inventoryClient = new InventoryClient();
	const itemCliemt = new ItemsClient(fetch, config.masterdataBaseUrl);
	return {
		monsters: await monsterClient.getMonsters(),
		inventory: await inventoryClient.getInventory(BigInt(user.userId)),
		itemMasterdata: await itemCliemt.getItemsMasterdata(),
	};
};
