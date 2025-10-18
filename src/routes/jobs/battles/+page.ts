import { config } from '$lib/config/config';
import { clients } from '$lib/service/connect';
import { JobsClient } from '$lib/service/jobs';
import { gameStateStore } from '$lib/stores/gamestate.svelte';
import { JobSubType } from '../../../gen/v1/masterdata_pb';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) => {
	const jobsClient = new JobsClient(fetch);
	const masterdata = clients.masterdataClient.getBattleJobs({ cityId: "city_1" });

	const p = await parent();
	const user = p.user;
	const allJobs = await masterdata;
	const relevantJobs = allJobs.jobs.filter((job) => job.definition!.subType === JobSubType.BATTLE);
	let activeJobs = await jobsClient.getJobs();
	activeJobs = activeJobs.filter((job) => job.def?.subType === JobSubType.BATTLE);

	return {
		masterdata: relevantJobs,
		jobs: activeJobs,
		monsters: await gameStateStore.getMonsters(),
	};
};
