import { JobsClient } from '$lib/service/jobs';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const jobsClient = new JobsClient(fetch);
	return {
		jobs: await jobsClient.getJobs(),
	};
};
