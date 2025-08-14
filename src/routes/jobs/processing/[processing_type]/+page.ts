import { JobsClient } from '$lib/service/jobs';
import { MonsterClient } from '$lib/service/monsters';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const jobsClient = new JobsClient();
	const monsterClient = new MonsterClient();
	const masterdata = jobsClient.getProcessingJobMasterdata();

	let activeGatheringJobs = await masterdata;
	activeGatheringJobs = activeGatheringJobs.filter((job) => job.jobType === params.processing_type);
	let activeJobs = await jobsClient.getJobs();
	activeJobs = activeJobs.filter((job) => job.jobType === params.processing_type);

	return {
		processingType: params.processing_type,
		masterdata: activeGatheringJobs,
		jobs: activeJobs,
		monsters: await monsterClient.getMonsters(),
	};
};
