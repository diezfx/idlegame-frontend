import { clients } from '$lib/service/connect';
import { InventoryClient } from '$lib/service/inventory';
import { MasterdataClient } from '$lib/service/masterdata';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) => {
	const p = await parent();
	const user = p.user;
	const inventoryClient = clients.inventoryClient;
	const masterdataClient = new MasterdataClient(fetch);


	const inventory = inventoryClient.getInventory({ userId: BigInt(user.userId) })

	return {
		inventory: (await inventory).totalItems,
		itemMasterdata: await masterdataClient.getItems(),
	};
};
