import { createClients } from '$lib/service/connect';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, fetch }) => {
	const p = await parent();
	const user = p.user;
	const inventoryClient = createClients(fetch).inventoryClient;
	return {
		inventory: await inventoryClient.getInventory({
			userId: BigInt(user.userId)
		}),
	};
};
