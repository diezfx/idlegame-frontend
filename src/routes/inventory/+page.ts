import { loadConfig } from '$lib/config/config';
import { InventoryClient } from '$lib/service/inventory';
import { JobsClient } from '$lib/service/jobs';
import { getUserFromContext } from '$lib/stores/user';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) => {
	const p = await parent();
	const user = p.user;
	const cfg = loadConfig();
	const inventoryClient = new InventoryClient(fetch, cfg.inventoryClientCfg);
	return {
		inventory: await inventoryClient.getInventory(user.userId),
	};
};
