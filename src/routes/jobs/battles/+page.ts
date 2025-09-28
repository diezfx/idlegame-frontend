import { config } from '$lib/config/config';
import { createClients } from '$lib/service/connect';
import { JobsClient } from '$lib/service/jobs';
import { MonsterClient } from '$lib/service/monsters';
import { JobSubType } from '../../../gen/v1/masterdata_pb';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const jobsClient = new JobsClient(fetch);
	const monsterClient = new MonsterClient(fetch);
	const masterdata = createClients(fetch).masterdataClient.getBattleJobs({ cityId: "city_1" });

	const allJobs = await masterdata;
	const relevantJobs = allJobs.jobs.filter((job) => job.definition!.subType === JobSubType.BATTLE);
	let activeJobs = await jobsClient.getJobs();
	activeJobs = activeJobs.filter((job) => job.def?.subType === JobSubType.BATTLE);

	return {
		masterdata: relevantJobs,
		jobs: activeJobs,
		monsters: await monsterClient.getMonsters(),
	};
};
