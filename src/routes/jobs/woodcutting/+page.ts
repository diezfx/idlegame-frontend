import { loadConfig } from '$lib/config/config';
import { JobsClient } from '$lib/service/jobs';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const cfg = loadConfig();
	const jobsClient = new JobsClient(fetch, cfg.jobsClientCfg);
	const masterdata = jobsClient.getJobMasterdata();

	let woodcuttingJobs = await masterdata;
	woodcuttingJobs = woodcuttingJobs.filter((job) => job.jobType === 'woodcutting');
	let activeJobs = await jobsClient.getJobs();
	activeJobs = activeJobs.filter((job) => job.jobDefId === 'woodcutting');

	return {
		masterdata: woodcuttingJobs,
		jobs: activeJobs,
	};
};
