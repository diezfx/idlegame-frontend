import { loadConfig } from '$lib/config/config';
import { JobsClient } from '$lib/service/jobs';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const cfg = loadConfig();
	const jobsClient = new JobsClient(fetch, cfg.jobsClientCfg);
	return {
		jobs: await jobsClient.getJobs(),
	};
};
