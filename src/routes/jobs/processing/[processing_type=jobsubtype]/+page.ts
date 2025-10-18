import { config } from '$lib/config/config';
import { clients } from '$lib/service/connect';
import { JobsClient } from '$lib/service/jobs';
import { gameStateStore } from '$lib/stores/gamestate.svelte';
import { JobSubType } from '../../../../gen/v1/masterdata_pb';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) => {
	const jobsClient = new JobsClient(fetch);;
	const masterdata = clients.masterdataClient;

	const processingType = parseInt(params.processing_type, 10);

	let activeProcessingJobs = (await masterdata.getProductionJobs({ cityId: "city_1" })).jobs;
	console.log(JobSubType[processingType]);
	activeProcessingJobs = activeProcessingJobs.filter((job) => job.definition!.subType === processingType);



	return {
		processingType: params.processing_type,
		masterdata: activeProcessingJobs,
	};
};
