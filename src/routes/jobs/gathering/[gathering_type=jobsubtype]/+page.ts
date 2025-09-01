import { JobsClient } from '$lib/service/jobs';
import { MonsterClient } from '$lib/service/monsters';
import { JobSubType } from '../../../../gen/v1/masterdata_pb';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const jobsClient = new JobsClient(fetch);
	const monsterClient = new MonsterClient(fetch);
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
