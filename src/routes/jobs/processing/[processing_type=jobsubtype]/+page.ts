import { config } from '$lib/config/config';
import { JobsClient } from '$lib/service/jobs';
import { MonsterClient } from '$lib/service/monsters';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const jobsClient = new JobsClient(fetch);
	const monsterClient = new MonsterClient(fetch);
	const masterdata = jobsClient.getJobMasterdata();

	const processingType = parseInt(params.processing_type, 10);

	let activeProcessingJobs = await masterdata;
	activeProcessingJobs = activeProcessingJobs.filter((job) => job.subType === processingType);
	let activeJobs = await jobsClient.getJobs();
	activeJobs = activeJobs.filter((job) => job.def?.subType === processingType);

	return {
		processingType: params.processing_type,
		masterdata: activeProcessingJobs,
		jobs: activeJobs,
		monsters: await monsterClient.getMonsters(),
	};
};
