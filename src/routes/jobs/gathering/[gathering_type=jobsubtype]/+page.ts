import { config } from '$lib/config/config';
import { JobsClient } from '$lib/service/jobs';
import { MonsterClient } from '$lib/service/monsters';
import { JobSubType } from '../../../../gen/v1/masterdata_pb';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const cfg = config;
	const jobsClient = new JobsClient(fetch, cfg.masterdataBaseUrl);
	const monsterClient = new MonsterClient();
	const masterdata = jobsClient.getJobMasterdata();

	const gatheringType = parseInt(params.gathering_type, 10);

	let activeGatheringJobs = await masterdata;
	console.log(JobSubType[gatheringType]);
	activeGatheringJobs = activeGatheringJobs.filter((job) => job.subType === gatheringType);
	let activeJobs = await jobsClient.getJobs();
	activeJobs = activeJobs.filter((job) => job.def?.subType === gatheringType);

	return {
		gatheringType: params.gathering_type,
		masterdata: activeGatheringJobs,
		jobs: activeJobs,
		monsters: await monsterClient.getMonsters(),
	};
};
