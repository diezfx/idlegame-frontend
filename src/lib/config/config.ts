// holds all configuration e.g. the api base url

import type { InventoryClientCfg } from '$lib/service/inventory';
import type { ItemsClientCfg } from '$lib/service/items';
import type { JobsClientCfg } from '$lib/service/jobs';
import type { MonsterClientCfg } from '$lib/service/monsters';
import { getContext, setContext } from 'svelte';

export interface Config {
	jobsClientCfg: JobsClientCfg;
	monsterClientCfg: MonsterClientCfg;
	inventoryClientCfg: InventoryClientCfg;
	itemClientCfg: ItemsClientCfg;
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
		itemClientCfg: {
			apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
			masterdataBaseUrl: import.meta.env.VITE_MASTERDATA_BASE_URL,
		},
	};
}

export function setConfigContext(cfg: Config): void {
	setContext('config', cfg);
}

export function getConfigContext(): Config {
	return getContext<Config>('config');
}
