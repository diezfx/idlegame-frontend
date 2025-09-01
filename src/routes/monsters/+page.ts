import { InventoryClient } from '$lib/service/inventory';
import { MasterdataClient } from '$lib/service/masterdata';
import { MonsterClient } from '$lib/service/monsters';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) => {
	const p = await parent();
	const user = p.user;
	const monsterClient = new MonsterClient(fetch);
	const inventoryClient = new InventoryClient(fetch);
	const masterdataClient = new MasterdataClient(fetch);

	return {
		monsters: await monsterClient.getMonsters(),
		inventory: await inventoryClient.getInventory(BigInt(user.userId)),
		itemMasterdata: await masterdataClient.getItems(),
	};
};
