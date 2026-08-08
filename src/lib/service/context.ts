import { getContext, setContext } from 'svelte';
import type { BattleService } from './battles';
import type { InventoryService } from './inventory';
import type { JobService } from './jobs';
import type { TutorialService } from './tutorial';

export type Services = {
	jobs: JobService;
	battles: BattleService;
	inventory: InventoryService;
	tutorial: TutorialService;
};

const servicesContextKey = Symbol('services');

export function setServicesContext(services: Services): void {
	setContext(servicesContextKey, services);
}

export function getServicesContext(): Services {
	const services = getContext<Services | undefined>(servicesContextKey);
	if (!services) {
		throw new Error('Services context has not been initialized');
	}
	return services;
}
