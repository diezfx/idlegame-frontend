import { clients } from '$lib/service/connect';
import { JobsClient } from '$lib/service/jobs';
import { gameStateStore } from '$lib/stores/gamestate.svelte';
import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ fetch, params }) => {
	const jobsClient = new JobsClient(fetch);
	const masterdata = await clients.masterdataClient.getBattleJobs({ cityId: 'city_1' });


	if (!params.id) {
		throw redirect(302, '/jobs/battles');
	}


	const battleJob = await jobsClient.getBattleJob(BigInt(params.id));
	if (!battleJob) {
		throw redirect(302, '/jobs/battles');
	}

	const monsters = await gameStateStore.getMonsters();

	return {
		masterdata,
		battleJob,
		monsters,
	};
};
