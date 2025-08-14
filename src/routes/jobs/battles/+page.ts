import { JobsClient } from '$lib/service/jobs';
import { MonsterClient } from '$lib/service/monsters';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const jobsClient = new JobsClient();
	const monsterClient = new MonsterClient();
	const masterdata = jobsClient.getBattleJobMasterdata();

	let activeGatheringJobs = await masterdata;
	activeGatheringJobs = activeGatheringJobs.filter((job) => job.jobType === 'battle');
	let activeJobs = await jobsClient.getJobs();
	activeJobs = activeJobs.filter((job) => job.jobType === 'battle');

	return {
		masterdata: activeGatheringJobs,
		jobs: activeJobs,
		monsters: await monsterClient.getMonsters(),
	};
};
