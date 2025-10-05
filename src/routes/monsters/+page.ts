import { createClients } from '$lib/service/connect';
import { InventoryClient } from '$lib/service/inventory';
import { MasterdataClient } from '$lib/service/masterdata';
import { MonsterClient } from '$lib/service/monsters';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) => {
	const p = await parent();
	const user = p.user;
	const monsterClient = new MonsterClient(fetch);
	const inventoryClient = createClients(fetch).inventoryClient;
	const masterdataClient = new MasterdataClient(fetch);


	const inventory = inventoryClient.getInventory({ userId: BigInt(user.userId) })

	return {
		monsters: await monsterClient.getMonsters(user.userId),
		inventory: (await inventory).totalItems,
		itemMasterdata: await masterdataClient.getItems(),
	};
};
