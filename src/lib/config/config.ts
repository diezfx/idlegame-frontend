// holds all configuration e.g. the api base url

import type { InventoryClientCfg } from '$lib/service/inventory';
import type { JobsClientCfg } from '$lib/service/jobs';
import type { MonsterClientCfg } from '$lib/service/monsters';

export interface Config {
	jobsClientCfg: JobsClientCfg;
	monsterClientCfg: MonsterClientCfg;
	inventoryClientCfg: InventoryClientCfg;
}

export function loadConfig(): Config {
	return {
		jobsClientCfg: {
			apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
			masterdataBaseUrl: import.meta.env.VITE_MASTERDATA_BASE_URL,
		},
		monsterClientCfg: {
			baseUrl: import.meta.env.VITE_API_BASE_URL,
		},
		inventoryClientCfg: {
			baseUrl: import.meta.env.VITE_API_BASE_URL,
		},
	};
}
