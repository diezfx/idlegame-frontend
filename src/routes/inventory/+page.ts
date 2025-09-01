import { InventoryClient } from '$lib/service/inventory';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, fetch }) => {
	const p = await parent();
	const user = p.user;
	const inventoryClient = new InventoryClient(fetch);
	return {
		inventory: await inventoryClient.getInventory(BigInt(user.userId)),
	};
};
