import { config } from '$lib/config/config';
import { JobsClient } from '$lib/service/jobs';
import { MonsterClient } from '$lib/service/monsters';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const cfg = config;
	const jobsClient = new JobsClient(fetch, cfg.masterdataBaseUrl);
	const monsterClient = new MonsterClient();
	const masterdata = jobsClient.getJobMasterdata();

	let activeGatheringJobs = await masterdata;
	activeGatheringJobs = activeGatheringJobs.filter((job) => job.jobType === params.gathering_type);
	let activeJobs = await jobsClient.getJobs();
	activeJobs = activeJobs.filter((job) => job.def?.jobType === params.gathering_type);

	return {
		gatheringType: params.gathering_type,
		masterdata: activeGatheringJobs,
		jobs: activeJobs,
		monsters: await monsterClient.getMonsters(),
	};
};
