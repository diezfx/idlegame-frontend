import { masterdataStore } from '$lib/stores/masterdata.svelte';
import { JobSubType } from '../../../gen/v1/masterdata_pb';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const allJobs = await masterdataStore.getBattleJobs();
	const relevantJobs = allJobs.filter((job) => job.definition!.subType === JobSubType.BATTLE);

	return {
		masterdata: relevantJobs,
	};
};
