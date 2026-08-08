import { masterdataStore } from '$lib/stores/masterdata.svelte';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		monsters: await masterdataStore.getMonsters(),
		starterMonsters: await masterdataStore.getStarterMonsters(),
	};
};
