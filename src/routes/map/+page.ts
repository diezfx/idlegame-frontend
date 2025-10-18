import { clients } from '$lib/service/connect';
import { gameStateStore } from '$lib/stores/gamestate.svelte';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ fetch, params, parent }) => {
	const masterdataClient = clients.masterdataClient;


	return {
		cities: (await masterdataClient.getCities({})).cities,
		monsters: gameStateStore.getMonsters(),
	};
};
