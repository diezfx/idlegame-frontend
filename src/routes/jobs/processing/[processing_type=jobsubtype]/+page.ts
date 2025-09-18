import { config } from '$lib/config/config';
import { createClients } from '$lib/service/connect';
import { JobsClient } from '$lib/service/jobs';
import { MonsterClient } from '$lib/service/monsters';
import { JobSubType } from '../../../../gen/v1/masterdata_pb';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const jobsClient = new JobsClient(fetch);
	const monsterClient = new MonsterClient(fetch);
	const masterdata = createClients(fetch).masterdataClient;

	const processingType = parseInt(params.processing_type, 10);

	let activeProcessingJobs = (await masterdata.getProductionJobs({ cityId: "city_1" })).jobs;
	console.log(JobSubType[processingType]);
	activeProcessingJobs = activeProcessingJobs.filter((job) => job.definition!.subType === processingType);
	let activeJobs = await jobsClient.getJobs();
	activeJobs = activeJobs.filter((job) => job.def?.subType === processingType);

	return {
		processingType: params.processing_type,
		masterdata: activeProcessingJobs,
		jobs: activeJobs,
		monsters: await monsterClient.getMonsters(),
	};
};
