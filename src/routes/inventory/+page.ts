import { InventoryClient } from '$lib/service/inventory';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const p = await parent();
	const user = p.user;
	const inventoryClient = new InventoryClient();
	return {
		inventory: await inventoryClient.getInventory(BigInt(user.userId)),
	};
};
